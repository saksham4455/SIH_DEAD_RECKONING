#pragma once

#include <array>
#include <atomic>
#include <cstddef>

namespace sih {
// Single-producer/single-consumer bounded queue for timestamped sensor packets.
template <typename T, std::size_t Capacity>
class RingBuffer {
public:
    bool push(const T& value) {
        const std::size_t head = head_.load(std::memory_order_relaxed);
        const std::size_t next = (head + 1) % Capacity;
        if (next == tail_.load(std::memory_order_acquire)) return false;
        buffer_[head] = value;
        head_.store(next, std::memory_order_release);
        return true;
    }

    bool pop(T& value) {
        const std::size_t tail = tail_.load(std::memory_order_relaxed);
        if (tail == head_.load(std::memory_order_acquire)) return false;
        value = buffer_[tail];
        tail_.store((tail + 1) % Capacity, std::memory_order_release);
        return true;
    }

    void clear() {
        const std::size_t head = head_.load(std::memory_order_acquire);
        tail_.store(head, std::memory_order_release);
    }

private:
    std::array<T, Capacity> buffer_{};
    std::atomic<std::size_t> head_{0};
    std::atomic<std::size_t> tail_{0};
};
}
