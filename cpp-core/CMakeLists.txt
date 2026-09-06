cmake_minimum_required(VERSION 3.14)
project(cpp_core VERSION 1.0.0 LANGUAGES CXX C)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

find_package(Threads REQUIRED)
find_package(Eigen3 REQUIRED)

file(GLOB_RECURSE SOURCES CONFIGURE_DEPENDS "src/*.cpp")

add_library(cpp_core SHARED ${SOURCES})
target_include_directories(cpp_core PUBLIC include)
target_compile_options(cpp_core PRIVATE $<$<CONFIG:Release>:-O3>)
target_link_libraries(cpp_core PRIVATE Threads::Threads Eigen3::Eigen)

set_target_properties(cpp_core PROPERTIES OUTPUT_NAME "cpp_core")
message(STATUS "CPP Core navigation library configured with C++17, PIC, threads, and optional Eigen3.")
