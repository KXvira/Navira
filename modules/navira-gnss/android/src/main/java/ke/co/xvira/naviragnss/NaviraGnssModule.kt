package ke.co.xvira.naviragnss

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.GnssStatus
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NaviraGnssModule : Module() {
  private val locationManager: LocationManager?
    get() = appContext.reactContext?.getSystemService(Context.LOCATION_SERVICE) as? LocationManager

  private var hasListener = false
  private var requested = false
  private var foreground = true
  private var registered = false
  private var gpsRequested = false

  // The GPS request activates tracking. GNSS callback registration alone does not guarantee it.
  // Positions from this request are deliberately discarded; Expo Location owns the position UI.
  private val gpsListener = object : LocationListener {
    override fun onLocationChanged(location: Location) = Unit
  }

  private val statusCallback = object : GnssStatus.Callback() {
    override fun onStarted() {
      if (registered) emitState("waiting")
    }

    override fun onStopped() {
      if (registered) emitState("unavailable")
    }

    override fun onSatelliteStatusChanged(status: GnssStatus) {
      if (!registered || !foreground) return
      val satellites = (0 until status.satelliteCount).map { index ->
        mapOf(
          "constellation" to constellationName(status.getConstellationType(index)),
          "svid" to status.getSvid(index),
          "cn0DbHz" to status.getCn0DbHz(index),
          "usedInFix" to status.usedInFix(index)
        )
      }
      sendEvent("onGnssStatus", mapOf(
        "state" to "receiving",
        "observedAtMs" to System.currentTimeMillis(),
        "observedElapsedRealtimeMs" to SystemClock.elapsedRealtime(),
        "satellites" to satellites,
        "reportedCount" to status.satelliteCount,
        "usedInFixCount" to satellites.count { it["usedInFix"] == true }
      ))
    }
  }

  override fun definition() = ModuleDefinition {
    Name("NaviraGnss")
    Events("onGnssStatus")

    OnStartObserving("onGnssStatus") {
      hasListener = true
      if (requested && foreground) startMonitoring()
    }
    OnStopObserving("onGnssStatus") {
      hasListener = false
      requested = false
      stopMonitoring()
    }
    OnActivityEntersForeground {
      foreground = true
      if (requested && hasListener) startMonitoring()
    }
    OnActivityEntersBackground {
      foreground = false
      stopMonitoring()
    }
    OnAppContextDestroys {
      requested = false
      stopMonitoring()
    }

    Function("start") {
      requested = true
      startMonitoring()
    }
    Function("stop") {
      requested = false
      stopMonitoring()
    }
  }

  private fun startMonitoring() {
    if (!requested || !hasListener || !foreground || registered || gpsRequested) return
    val context = appContext.reactContext ?: run {
      emitState("unavailable")
      return
    }
    if (context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
      emitState("permission-denied")
      return
    }
    if (!context.packageManager.hasSystemFeature(PackageManager.FEATURE_LOCATION_GPS)) {
      emitState("unsupported")
      return
    }
    val manager = locationManager ?: run {
      emitState("unavailable")
      return
    }
    if (!manager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
      emitState("services-disabled")
      return
    }

    try {
      // Explicit GPS_PROVIDER request: Expo Location uses the fused provider and may not activate GNSS.
      manager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 0f, gpsListener, Looper.getMainLooper())
      gpsRequested = true
      val accepted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        manager.registerGnssStatusCallback(context.mainExecutor, statusCallback)
      } else {
        manager.registerGnssStatusCallback(statusCallback, Handler(Looper.getMainLooper()))
      }
      if (!accepted) {
        stopMonitoring()
        emitState("unavailable")
        return
      }
      registered = true
      emitState("waiting")
    } catch (error: SecurityException) {
      stopMonitoring()
      emitState("permission-denied")
    } catch (error: IllegalArgumentException) {
      stopMonitoring()
      emitState("unavailable")
    } catch (error: RuntimeException) {
      stopMonitoring()
      emitState("error")
    }
  }

  private fun stopMonitoring() {
    val manager = locationManager
    if (registered) {
      registered = false
      manager?.unregisterGnssStatusCallback(statusCallback)
    }
    if (gpsRequested) {
      gpsRequested = false
      manager?.removeUpdates(gpsListener)
    }
  }

  private fun emitState(state: String) {
    sendEvent("onGnssStatus", mapOf("state" to state))
  }

  private fun constellationName(value: Int): String = when (value) {
    GnssStatus.CONSTELLATION_GPS -> "GPS"
    GnssStatus.CONSTELLATION_GLONASS -> "GLONASS"
    GnssStatus.CONSTELLATION_GALILEO -> "Galileo"
    GnssStatus.CONSTELLATION_BEIDOU -> "BeiDou"
    GnssStatus.CONSTELLATION_QZSS -> "QZSS"
    GnssStatus.CONSTELLATION_SBAS -> "SBAS"
    GnssStatus.CONSTELLATION_IRNSS -> "NavIC"
    else -> "Unknown"
  }
}
