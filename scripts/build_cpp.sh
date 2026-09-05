#!/bin/bash
echo 'Building C++ Navigation Core...'
cd cpp-core && mkdir -p build && cd build && cmake .. && make -j4

