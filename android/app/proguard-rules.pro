# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native core / JNI bridges are reached reflectively from C++.
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep,includedescriptorclasses class * implements com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * { @com.facebook.react.bridge.ReactMethod <methods>; }
-keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }
-keepclassmembers class * { @com.facebook.common.internal.DoNotStrip *; }
-keepclasseswithmembernames class * { native <methods>; }
-dontwarn com.facebook.react.**

# Nitro modules (react-native-nitro-modules / nitro-sound) use JNI lookups.
-keep class com.margelo.nitro.** { *; }
-dontwarn com.margelo.nitro.**

# Agora RTC SDK loads classes from native code.
-keep class io.agora.** { *; }
-dontwarn io.agora.**

# Google Maps / Play Services used by react-native-maps.
-keep class com.google.android.gms.maps.** { *; }
-dontwarn com.google.android.gms.**

# Keep annotations and generic signatures needed for JSON/Kotlin reflection.
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod
-keepattributes SourceFile, LineNumberTable
