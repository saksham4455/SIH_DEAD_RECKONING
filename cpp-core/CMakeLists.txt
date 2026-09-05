cmake_minimum_required(VERSION 3.14)
project(cpp_core VERSION 1.0.0 LANGUAGES CXX C)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# Source files
file(GLOB_RECURSE SOURCES "src/*.cpp" "ffi/*.cpp")

add_library(cpp_core SHARED ${SOURCES})

message(STATUS "CPP Core navigation library configured.")
