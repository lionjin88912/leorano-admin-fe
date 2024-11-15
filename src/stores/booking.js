import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBookingStore = defineStore('booking-store', () => {
  const state = ref({})

  function booking(selected) {
    state.value = selected
  }

  return { state, booking }
})
