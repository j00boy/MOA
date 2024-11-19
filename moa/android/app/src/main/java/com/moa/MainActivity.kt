package com.moa

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "moa"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIntent(intent) // 앱이 실행될 때 Intent 데이터 처리
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent) // 앱이 백그라운드에 있다가 새 Intent로 실행될 때 데이터 처리
    }

    private fun handleIntent(intent: Intent) {
        when (intent.action) {
            Intent.ACTION_SEND -> {
                // 단일 이미지 처리
                val imageUri: Uri? = intent.getParcelableExtra(Intent.EXTRA_STREAM)
                if (imageUri != null) {
                    sendEventToReactNative("ImageReceived", listOf(imageUri.toString()))
                }
            }
            Intent.ACTION_SEND_MULTIPLE -> {
                // 다중 이미지 처리
                val imageUris: ArrayList<Uri>? = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM)
                if (imageUris != null) {
                    val uriStrings = imageUris.map { it.toString() }
                    sendEventToReactNative("ImagesReceived", uriStrings)
                }
            }
        }
    }

    private fun sendEventToReactNative(eventName: String, data: List<String>) {
        val reactContext = reactInstanceManager.currentReactContext
        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, data)
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}