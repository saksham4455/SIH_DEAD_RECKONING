cmake_minimum_required(VERSION 3.14)
project(sih_dead_reckoning LANGUAGES CXX)

set(BINARY_NAME "sih_dead_reckoning")
add_executable(${BINARY_NAME} WIN32 runner/main.cpp)
