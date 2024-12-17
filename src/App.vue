<script setup lang="ts">
import { ref } from 'vue'
import FileUploadComponent from './components/fileUploader/file-upload.vue'
// import ToastComp from './components/toast/toastComp.vue'
import logo from './assets/fvdLogo.png'
import { DetectServiceProxy } from './services/fdv-services.ts'

const menuList = ref([
  { label: 'Upload', isActive: true, icon: 'fa-solid fa-upload' },
  { label: 'Youtube', isActive: false, icon: 'fa-brands fa-youtube' },
  { label: 'Link', isActive: false, icon: 'fa-solid fa-link' },
  { label: 'Listen', isActive: false, icon: 'fa-solid fa-ear-listen' },
])
const activeMenu = ref(menuList.value[0])
const youtubeLink = ref('')
const mediaLink = ref('')
const loading = ref(false)
const showToastAlert = ref(false)
const toastContent = ref('')
const toastType = ref('')
const fileUploaded = ref(null)
const analysisResponse = ref(null)
// New state for microphone recording
const isRecording = ref(false)
const mediaRecorderRef = ref<MediaRecorder | null>(null)
const audioChunksRef = ref<Blob[]>([])
// New states for audio playback
const isAudioPlaying = ref(false)
const audioPlayerRef = ref<HTMLAudioElement | null>(null)

const setActiveMenu = (index) => {
  menuList.value.forEach((menu, i) => {
    menu.isActive = i === index
  })
  activeMenu.value = menuList.value[index]
  analysisResponse.value = null
}

// Method to start recording
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.value = new MediaRecorder(stream)

    mediaRecorderRef.value.ondataavailable = (event) => {
      audioChunksRef.value.push(event.data)
    }

    mediaRecorderRef.value.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.value, { type: 'audio/mp3' })
      const audioFile = new File([audioBlob], 'recording.mp3', { type: 'audio/mp3' })
      fileUploaded.value = audioFile
      audioChunksRef.value = []
    }

    mediaRecorderRef.value.start()
    isRecording.value = true
  } catch (error) {
    console.error('Error accessing microphone:', error)
    showToast('Error', 'Could not access microphone')
  }
}

// Method to stop recording
const stopRecording = () => {
  if (mediaRecorderRef.value) {
    mediaRecorderRef.value.stop()
    isRecording.value = false
  }
}

// Method to play recorded audio
const playRecording = () => {
  if (fileUploaded.value && audioPlayerRef.value) {
    const audioUrl = URL.createObjectURL(fileUploaded)
    audioPlayerRef.value.src = audioUrl
    audioPlayerRef.value.play()
    IsAudioPlaying.value = true
  }
}

// Method to pause recorded audio
const pauseRecording = () => {
  if (audioPlayerRef.value) {
    audioPlayerRef.value.pause()
    IsAudioPlaying.value = false
  }
}

// Handle audio playback end
// const handleAudioPlaybackEnd = () => {
//   setIsAudioPlaying(false);
// };

const analyzeMain = () => {
  const actions: { [key: string]: () => void } = {
    Youtube: () => {
      if (youtubeLink.value) {
        analyseYoutubeLink()
      } else {
        showToast('Error', 'Please enter youtube link')
      }
    },
    Upload: () => {
      if (fileUploaded.value) {
        uploadFile()
      } else {
        showToast('Error', 'Please upload a file to analyse')
      }
    },
    Listen: () => {
      if (fileUploaded.value) {
        uploadFile()
      } else {
        showToast('Error', 'Please record an audio to analyse')
      }
    },
    Link: () => {
      if (mediaLink.value) {
        analyseLink()
      } else {
        showToast('Error', 'Please enter a media link')
      }
    },
  }

  const action = actions[activeMenu.value.label]
  if (action) {
    action() // {{ edit_1 }}
  } else {
    showToast('Error', 'Invalid menu option') // Optional: Handle invalid menu
  }
}

// Utility method to show toast
const showToast = (type: string, content: string) => {
  showToastAlert.value = true
  toastType.value = type
  toastContent.value = content
  setTimeout(() => {
    showToastAlert.value = false
  }, 3000)
}

const roundToTwoDecimalPlaces = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

const analyseYoutubeLink = async () => {
  loading.value = true
  try {
    const payload = new Data().clone()
    payload.url = youtubeLink
    const data = await new DetectServiceProxy(undefined, undefined).youtubeLink(payload)
    loading.value = false
    analysisResponse.value = data
    showToast('Success', 'Analyzed successfully')
  } catch (error) {
    loading.value = false
    console.log(error)
  }
}

const analyseLink = async () => {
  loading.value = true
  try {
    const payload = new Data().clone()
    payload.url = mediaLink
    const data = await new DetectServiceProxy(undefined, undefined).link(payload)
    loading.value = false
    analysisResponse.value = data
    showToast('Success', 'Analyzed successfully')
  } catch (error) {
    loading.value = false
    console.log(error)
  }
}

const uploadFile = async () => {
  loading.value = true
  try {
    const payload: FileParameter = {
      data: fileUploaded.value,
      fileName: fileUploaded.value.name,
    }
    const data = await new DetectServiceProxy(undefined, undefined).fileUpload(payload)
    loading.value = false
    analysisResponse.value = data
    showToast('Success', 'Analyzed successfully')
  } catch (error) {
    loading.value = false
    console.log(error)
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>

<template>
  <div class="h-screen w-full flex items-center justify-center">
    <div>
      <div class="bg-bgDark p-4 rounded-lg">
        <div class="grid md:grid-cols-12 grid-cols-1">
          <div>
            <div class="flex justify-center mb-6">
              <img :src="logo" alt="logo" class="w-[4rem]" />
            </div>
            <div class="flex flex-col space-y-4 text-white text-xs font-medium">
              <div
                v-for="(menu, index) in menuList"
                :key="index"
                @click="setActiveMenu(index)"
                :class="{
                  'border-l-2 border-l-primary': menu.isActive,
                  'border-none': !menu.isActive,
                }"
                class="flex flex-col space-y-2 cursor-pointer p-2"
              >
                <span class="flex justify-center">
                  <i :class="menu.icon"></i>
                </span>
                <span class="text-center">{{ menu.label }}</span>
              </div>
            </div>
          </div>
          <div class="col-span-11 ml-4">
            <div class="flex flex-col space-y-4 h-full">
              <span class="flex text-start text-primary font-medium"
                >Fake Voice Detector - {{ activeMenu.label }}</span
              >
              <div class="bg-lightDark h-full w-full rounded-lg">
                <div v-if="showToastAlert">
                  <span
                    class="text-sm font-medium p-2"
                    :class="{
                      'text-red-500': toastType === 'Error',
                      'text-green-500': toastType === 'Success',
                    }"
                    >{{ toastType }} : {{ toastContent }}</span
                  >
                </div>
                <div class="flex items-center h-full p-6 w-full">
                  <div class="grid md:grid-cols-2 grid-cols-1 w-full">
                    <div class="p-2">
                      <div v-if="activeMenu.label === 'Upload'">
                        <FileUploadComponent v-model="fileUploaded" />
                      </div>
                      <div v-if="activeMenu.label === 'Youtube'">
                        <div class="mb-6">
                          <label class="block mb-2 text-xs font-medium text-white text-left"
                            >Paste a Youtube URL</label
                          >
                          <input
                            v-on:keyup="
                              (e: any) => {
                                youtubeLink.value = e.target.value
                              }
                            "
                            type="text"
                            id="utubelink"
                            class="bg-[#f7f9fc] w-full border border-gray-300 text-sm rounded-lg block w-full p-2.5 focus:ring-0 focus:border-primary"
                            placeholder="youtube url"
                            required
                          />
                        </div>
                      </div>
                      <div v-if="activeMenu.label === 'Link'">
                        <div class="mb-6">
                          <label class="block mb-2 text-xs font-medium text-white text-left"
                            >Paste an audio link</label
                          >
                          <input
                            v-on:keyup="
                              (e: any) => {
                                mediaLink.value = e.target.value
                              }
                            "
                            type="text"
                            id="utubelink"
                            class="bg-[#f7f9fc] w-full border border-gray-300 text-sm rounded-lg block w-full p-2.5 focus:ring-0 focus:border-primary"
                            placeholder="audio link"
                            required
                          />
                        </div>
                      </div>

                      <div v-if="activeMenu.label === 'Listen'">
                        <div class="flex flex-col items-center space-y-4">
                          <div class="flex items-center space-x-4">
                            <div
                              v-if="!fileUploaded"
                              class="flex flex-col space-y-2 justify-center"
                            >
                              <button
                                @click="isRecording ? stopRecording() : startRecording()"
                                :class="{ 'bg-red-500': isRecording, 'bg-lightDark': !isRecording }"
                                class="w-10 h-10 rounded-full border border-primary text-white text-xs font-medium"
                              >
                                <i v-if="isRecording" class="fa-solid fa-stop text-primary"></i>
                                <i
                                  v-if="!isRecording"
                                  class="fa-solid fa-microphone text-primary"
                                ></i>
                              </button>
                              <span class="text-white text-xs font-medium">{{
                                isRecording ? 'Stop' : 'Record'
                              }}</span>
                            </div>

                            <div v-if="fileUploaded && !isRecording">
                              <div class="flex items-center space-x-2">
                                <div class="flex flex-col space-y-2 justify-center">
                                  <button
                                    @click="isAudioPlaying ? pauseRecording() : playRecording()"
                                    class="text-xs font-medium bg-lightDark w-10 h-10 border border-primary rounded-full text-white"
                                  >
                                    <i v-if="isAudioPlaying" class="fa-solid fa-pause"></i>
                                    <i v-if="!isAudioPlaying" class="fa-solid fa-play"></i>
                                  </button>
                                  <audio
                                    ref="{audioPlayerRef}"
                                    onEnded="{handleAudioPlaybackEnd}"
                                    class="hidden"
                                  />
                                  <span class="text-white text-xs font-medium">Play</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div v-if="fileUploaded">
                            <div class="text-white text-xs">
                              Recording ready to analyze, you can
                              <span
                                class="cursor-pointer text-primary"
                                @click="fileUploaded.value = ''"
                                >discard</span
                              >
                              and record a new audio
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-col space-y-4">
                      <div v-if="loading" role="status">
                        <svg
                          aria-hidden="true"
                          class="inline w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-primary"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        <span class="sr-only">Loading...</span>
                      </div>
                      <div v-else class="flex items-center justify-center h-full w-full">
                        <button
                          @click="analyzeMain()"
                          class="text-xs font-medium bg-primary w-20 h-20 rounded-full text-white"
                        >
                          Analyze
                        </button>
                      </div>
                      <div v-if="analysisResponse" class="text-white font-medium text-xs">
                        The analysis indicates a low-confidence determination that the item is
                        {{ analysisResponse.is_fake ? ' fake' : ' not fake' }}, with a confidence
                        level of approximately
                        {{ roundToTwoDecimalPlaces(analysisResponse.confidence * 100) }}%.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <ToastComp
        v-if="showToastAlert"
        :showToastAlert="showToastAlert"
        :status="toastType"
        :content="toastContent"
        @closeClick="showToastAlert.value = false"
      /> -->
    </div>
  </div>
</template>
