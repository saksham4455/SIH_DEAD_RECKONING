#!/usr/bin/env bash
set -euo pipefail

: "${ANDROID_NDK_HOME:?Set ANDROID_NDK_HOME before building Android native code}"
for abi in armeabi-v7a arm64-v8a; do
  cmake -S cpp-core -B "build/android-$abi" \
    -DCMAKE_TOOLCHAIN_FILE="$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake" \
    -DANDROID_ABI="$abi" -DANDROID_PLATFORM=android-24 -DCMAKE_BUILD_TYPE=Release
  cmake --build "build/android-$abi" --config Release
done
