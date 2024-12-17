<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'ToastComp',
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) => ['Warning', 'Success', 'Error'].includes(value),
    },
    content: {
      type: String,
      required: true,
    },
    showToastAlert: {
      type: Boolean,
      default: false,
    },
    closeClick: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    const toastPop = ref(false)

    watch(
      () => props.showToastAlert,
      (newValue) => {
        toastPop.value = newValue
        setTimeout(() => {
          toastPop.value = false
          props.closeClick(false)
        }, 3000)
      },
    )

    const closeToast = () => {
      toastPop.value = false
      props.closeClick(false)
    }

    return { toastPop, closeToast }
  },
})
</script>

<template>
  <div class="w-full fixed top-0 right-0 z-10">
    <div v-if="toastPop">
      <div v-if="status === 'Success'" class="w-full flex justify-end">
        <div class="absolute top-10 right-10 z-10">
          <div class="flex flex-row justify-between w-full">
            <div class="flex flex-1 flex-row">
              <div
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500"
              >
                <!-- SVG for Success icon -->
              </div>
              <div class="ml-3 text-sm font-medium">{{ content }}</div>
            </div>
            <div class="flex items-center justify-end cursor-pointer" @click="closeToast">
              <!-- SVG for close icon -->
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="status === 'Error'" class="w-full flex justify-end">
        <div class="absolute top-10 right-10 z-10">
          <div class="flex flex-row justify-between w-full">
            <div class="flex flex-1 flex-row">
              <div
                class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg"
              >
                <!-- SVG for Error icon -->
              </div>
              <div class="ml-3 text-sm font-medium flex items-center">{{ content }}</div>
            </div>
            <div class="flex items-center justify-end cursor-pointer" @click="closeToast">
              <!-- SVG for close icon -->
            </div>
          </div>
        </div>
      </div>
      <div v-else class="w-full flex justify-end">
        <div class="absolute top-10 right-10 z-10">
          <div class="flex flex-row justify-between w-full">
            <div class="flex flex-1 flex-row">
              <div
                class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg"
              >
                <!-- SVG for Warning icon -->
              </div>
              <div class="ml-3 text-sm font-medium">{{ content }}</div>
            </div>
            <div class="flex items-center justify-end cursor-pointer" @click="closeToast">
              <!-- SVG for close icon -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any necessary styles here */
</style>
