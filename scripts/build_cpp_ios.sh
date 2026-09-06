#!/usr/bin/env bash
set -euo pipefail

xcodebuild -project frontend/ios/Runner.xcodeproj \
  -scheme Runner -configuration Release \
  -sdk iphoneos -derivedDataPath build/ios
