<template>
    <div>
        <div class="cam-dash">
            <qrcode-stream @error="onError" :paused="paused" @detect="onDetect" @camera-on="onCameraOn"
                @camera-off="onCameraOff" v-if="!destroyed">
                <div v-if="loading">
                    <span class="loading-indicator">Loading...</span>
                </div>
                <div v-show="showScanConfirmation" class="scan-confirmation">
                    <img src="../assets/checkmark.svg" alt="checkmark" width="128">
                </div>
            </qrcode-stream>
            <p class="decode-result wrap-cam" v-if="!loading">
                CODE QR: <b class="result">{{ result }}</b>
            </p>
            <div class="btn-wrapper">
                <div v-if="!loading" class="btn-cam" @click="reload">
                    <span class="text-cam">Try Again</span>
                </div>
                <div v-if="!loading" class="btn-cam" @click="onData">
                    <span class="text-cam">Submit Code</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

import { QrcodeStream } from 'vue-qrcode-reader';
import { getDatabase, ref, push, get, update } from 'firebase/database';

export default {
    name: 'CamDetector',

    components: {
        QrcodeStream
    },

    data() {
        return {
            loading: true,
            destroyed: false,
            paused: false,
            result: '',
            showScanConfirmation: false
        }
    },

    methods: {
        onError(error) {
            console.error(error);
        },

        async onData() {
            const db = getDatabase();
            const sendQrCode = ref(db);

            if (this.result) {
                try {
                    // Check if the QR code already exists
                    const snapshot = await get(sendQrCode);
                    const existingData = snapshot.val();

                    // Find if the code already exists and how many times it has been used
                    const existingEntry = Object.entries(existingData || {}).find(([, item]) => item.codeQr === this.result);

                    if (existingEntry) {
                        const [codeKey, entryData] = existingEntry;
                        console.log(codeKey, entryData);

                        // Check if the code has been used before
                        if (entryData.used) {
                            this.$notify({
                                title: 'The code has been used before',
                                type: 'error'
                            });
                        } else {
                            // Mark the code as used for the first time
                            await update(ref(db, `${codeKey}`), { used: true });

                            this.$notify({
                                title: 'QR code success',
                                type: 'success'
                            });
                        }
                    } else {
                        // If the QR code doesn't exist
                        this.$notify({
                            title: 'Code Tidak Sesuai',
                            type: 'error'
                        });
                    }
                } catch (error) {
                    console.error('Error accessing the database:', error);
                    this.$notify({
                        title: 'Database error',
                        type: 'error'
                    });
                }
            }
        },

        async onDetect(detectedCodes) {
            if (detectedCodes.length > 0) {
                this.result = detectedCodes[0].rawValue;

                this.showScanConfirmation = true;

                this.paused = true;
                await this.timeOut(500);
                this.paused = false;
            }
        },

        onCameraOn() {
            this.showScanConfirmation = false;
            this.loading = false;
        },

        onCameraOff() {
            this.showScanConfirmation = true
        },

        timeOut(ms) {
            return new Promise((resolve) => {
                window.setTimeout(resolve, ms)
            })
        },

        async reload() {
            this.result = '';
            this.destroyed = true;
            await this.$nextTick();
            this.destroyed = false;
            this.loading = false;
        }
    }
}
</script>

<style scoped>
.btn-wrapper {
    display: flex;
    flex-direction: row;
    margin: 3px;
}

.cam-dash {
    width: 800px;
    height: auto;
}

@media screen and (max-width: 600px) {
    .cam-dash {
        width: 100%;
        height: auto;
    }
}

.wrap-cam {
    padding: 20px 0;
    font-size: 20px;
    font-family: 'Times New Roman', Times, serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.scan-confirmation {
    position: absolute;
    width: 100%;
    height: 100%;

    background-color: rgba(255, 255, 255, 0.8);

    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
}

.result {
    font-size: 20px;
    color: white;
    font-weight: 400;
    font-family: 'Times New Roman', Times, serif;
}

.btn-cam {
    width: 100px;
    height: 30px;
    color: blue;
    background: white;
    border-radius: 20px;
    margin: 0 auto;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: center;
}

.text-cam {
    display: flex;
    color: black;
    font-weight: 400;
    font-family: 'Times New Roman', Times, serif;
}

.loading-indicator {
    font-weight: bold;
    font-size: 5rem;
    text-align: center;
}

@media screen and (max-width: 600px) {
    .loading-indicator {
        font-size: 20px;
        display: flex;
        text-align: center;
        justify-content: center;
    }
}
</style>