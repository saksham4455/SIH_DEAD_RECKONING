cmake_minimum_required(VERSION 3.10)
project(runner LANGUAGES CXX)

set(BINARY_NAME "sih_dead_reckoning")
add_executable(${BINARY_NAME} runner/main.cc runner/my_application.cc)
