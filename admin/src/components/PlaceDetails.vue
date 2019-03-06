<template>
  <b-form @submit="savePlace" class="place-form">
    <div class="toolbar bg-light">
      <b-button variant="outline-secondary" class="float-left" @click="$router.push({name: 'PlaceList'})">
        <i class="fas fa-chevron-left"></i> Vissza
      </b-button>
      <b-button type="submit" variant="success" class="float-right" :disabled="$v.selectedPlace.$invalid">
        <i class="fas fa-check"></i> Mentés
      </b-button>
      <h4>Helyszín szerkesztése</h4>
      <b-alert variant="success" :show="saveSuccessCountDown" @dismiss-count-down="saveSuccessCountDown = $event">Módosítások elmentve</b-alert>
    </div>
    <div class="toolbar-placeholder"></div>
    <b-form-group label="Megnevezés:" label-for="title">
      <b-form-input
        id="title"
        type="text"
        v-model="selectedPlace.title"
        required
        :state="$v.selectedPlace.title.$dirty ? !$v.title.$error : null"
        aria-describedby="titleLiveFeedback"
        :disabled="sending" />
      <b-form-invalid-feedback id="titleLiveFeedback">
        Ennek a mezőnek a kitöltése kötelező
      </b-form-invalid-feedback>
    </b-form-group>
    <b-form-group label="Leírás:" label-for="description">
      <b-form-textarea
        id="description"
        v-model="selectedPlace.description"
        rows="2"
        max-rows="6"
      />
    </b-form-group>
    <b-form-group label="Link:" label-for="link">
      <b-form-input
        id="link"
        type="text"
        v-model="selectedPlace.link"
        :disabled="sending" />
    </b-form-group>
    <b-form-group label="Kategória:" label-for="category">
      <b-form-select v-model="selectedPlace.category" name="category">
        <option value="gerillakert">Gerillakertészkedés</option>
        <option value="akcio">Akció</option>
        <option value="streetart">Streetart</option>
        <option value="varos">Városfelújítás</option>
      </b-form-select>
    </b-form-group>
    <b-form-group label="Esemény dátuma:" label-for="date" description="Elfogadott formátumok: ÉÉÉÉ-HH-NN, ÉÉÉÉ.HH.NN, ÉÉÉÉ.HH.NN., ÉÉÉÉ. HH. NN.">
      <b-form-input
        id="date"
        type="text"
        v-model="selectedPlace.date"
        :state="$v.selectedPlace.date.$dirty ? !$v.date.$error : null"
        aria-describedby="dateLiveFeedback"
        :disabled="sending" />
      <b-form-invalid-feedback id="dateLiveFeedback">
        Nem megfelelő formátum
      </b-form-invalid-feedback>
    </b-form-group>
    <b-form-checkbox switch v-model="selectedPlace.featured" name="featured">
      Kiemelés
    </b-form-checkbox>
    <br>
    <div>
      <div>Fényképek (max. 6 db)</div>

      <vue-dropzone ref="myVueDropzone" id="dropzone" :options="dropzoneOptions"
                    v-on:vdropzone-file-added="onAdded"
                    v-on:vdropzone-processing="onProcessing"
                    v-on:vdropzone-queue-complete="onSuccess"></vue-dropzone>

      <draggable v-model="selectedPlace.images" @start="drag=true" @end="drag=false" style="overflow: hidden;">
        <div v-for="image in selectedPlace.images" :key="image" class="image-thumb"
             :style="`background-image: url(${imageCDN}/${image}/320px-${image})`">
          <b-button variant="danger" size="sm" class="image-remove" title="Kép eltávolítása" @click="removeImage(image)">
            <i class="fas fa-trash-alt"></i>
          </b-button>
        </div>
      </draggable>
    </div>
    <br>
    <b-form-group label="Koordináták megadása:" label-for="coordinatesInput">
      <b-input-group>
        <b-form-input
          id="coordinatesInput"
          type="text"
          v-model="coordinatesInput"
          :disabled="sending" />
        <b-input-group-append>
          <b-button variant="secondary" @click="parseCoordinates">Marker elhelyezése</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <b-form-group label="Cím a térképről:" label-for="address">
      <b-form-input
        id="address"
        type="text"
        v-model="selectedPlace.addressAtCoordinates"
        :state="$v.selectedPlace.addressAtCoordinates.$dirty ? !$v.addressAtCoordinates.$error : null"
        aria-describedby="coordinatesInputLiveFeedback"
        disabled />
      <b-form-invalid-feedback id="coordinatesInputLiveFeedback">
        Válassz egy helyet a térképen vagy adj meg koordinátákat
      </b-form-invalid-feedback>
    </b-form-group>
    <b-form-checkbox switch v-model="selectedPlace.useCustomAddress" @input="copyAddress">
      Megjelenített cím szerkesztése
    </b-form-checkbox>
    <b-form-group label="Megjelenített cím:" label-for="customAddress" v-if="selectedPlace.useCustomAddress">
      <b-form-input
        id="customAddress"
        type="text"
        v-model="selectedPlace.customAddress"
        :disabled="sending" />
    </b-form-group>
    <br>
    <b-button variant="danger" @click="deletePlace">
      <i class="fas fa-trash-alt"></i> Helyszín törlése
    </b-button>
  </b-form>
</template>

<script>
import uuidv4 from 'uuid/v4'
import moment from 'moment'
import axios from 'axios'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import draggable from 'vuedraggable'
import { mapState } from 'vuex'
import { validationMixin } from 'vuelidate'
import { helpers, required } from 'vuelidate/lib/validators'

const dateFormats = ['YYYY-MM-DD', 'YYYY.MM.DD', 'YYYY.MM.DD.', 'YYYY. MM. DD.']

let dateFormat = (value) => !helpers.req(value) || moment(value, dateFormats).isValid()

export default {
  name: 'PlaceDetails',
  props: ['id'],
  components: {
    'vue-dropzone': vue2Dropzone,
    draggable
  },
  mixins: [validationMixin],
  data: () => ({
    imageCDN: process.env.VUE_APP_IMAGE_URL,
    saveSuccessCountDown: 0,
    selectedPlace: {},
    dropzoneOptions: {
      url: '/',
      method: 'put',
      parallelUploads: 1,
      uploadMultiple: false,
      autoProcessQueue: false,
      acceptedFiles: 'image/jpeg,image/png,image/tiff,image/gif',
      maxFiles: 6,
      sending (file, xhr) {
        let _send = xhr.send
        xhr.send = () => {
          _send.call(xhr, file)
        }
      }
    },
    uploadInProgress: false,
    coordinatesInput: null,
    sending: false,
    watchers: {}
  }),
  computed: {
    ...mapState([
      'places'
    ]),
  },
  validations: {
    selectedPlace: {
      title: {
        required
      },
      category: {
        required
      },
      date: {
        dateFormat
      },
      addressAtCoordinates: {
        required
      }
    }
  },
  methods: {
    setLoading (val) {this.$store.commit('loading', val)},
    setSending (val) {this.sending = val},
    init () {
      if (this.id && this.places.length > 0) {
          this.selectedPlace = this.places.find(p => p.placeId === this.id)
          this.$store.commit('selectPlace', this.selectedPlace)
      }
      else if (!this.id) {
        this.selectedPlace = {
          placeId: uuidv4(),
          title: null,
          description: null,
          type: null,
          date: null,
          images: [],
          coordinates: null,
          link: null,
          addressAtCoordinates: null,
          customAddress: null,
          useCustomAddress: null
        }
        this.$store.commit('selectPlace', this.selectedPlace)
      }
    },
    getAddress () {
      const coords = this.selectedPlace.coordinates

      axios.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&osm_type=R&addressdetails=1'
        + '&lat=' + coords.lat + '&lon=' + coords.lng)
        .then(response => {
          let addr = response.data.address
          let city = addr.city || addr.town || addr.village || addr.hamlet || addr.county
          let road = addr.road || addr.pedestrian

          this.selectedPlace.addressAtCoordinates = city + (road ? (', ' + road) : '')
        })
        .catch(err => console.error(err))
    },
    copyAddress () {
      if (this.selectedPlace.useCustomAddress && !this.selectedPlace.customAddress) {
        this.selectedPlace.customAddress = this.selectedPlace.addressAtCoordinates
      }
    },
    parseCoordinates() {
      if (this.coordinatesInput) {
        let coords = this.coordinatesInput.match(/[\d.]+/g)
        if (coords.length === 2) {
          this.selectedPlace.coordinates = {lat: coords[0], lng: coords[1]}
          this.$emit('coordinatesChanged', this.selectedPlace.coordinates)
          this.coordinatesInput = null
        }
      }
    },
    getValidationClass (fieldName) {
      const field = this.$v.selectedPlace[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    clearForm () {
      this.$v.$reset()
    },
    savePlace (evt) {
      evt.preventDefault()
      this.setLoading(true)
      this.setSending(true)

      if (this.selectedPlace.date) {
        this.selectedPlace.date = moment(this.selectedPlace.date, dateFormats)
          .format('YYYY-MM-DD')
      }

      this.$api.savePlace(this.selectedPlace)
        .then(response => {
          if (this.$refs.myVueDropzone.getQueuedFiles().length > 0) {
            this.$refs.myVueDropzone.processQueue()
            this.selectedPlace.images = []
          }
          else {
            this.setLoading(false)
            this.setSending(false)
            this.saveSuccessCountDown = 5
          }
        })
        .catch(console.error)
    },
    deletePlace () {
      this.setLoading(true)

      this.$api.deletePlace(this.selectedPlace.placeId)
        .then(response => {
          this.setLoading(false)
          this.$router.push({name: 'PlaceList'})
        })
        .catch(err => console.error(err))
    },
    onProcessing (file) {
      this.$refs.myVueDropzone.setOption('headers', this.$api.headers())
      this.$refs.myVueDropzone.setOption('url', this.$api.endpoint() + '/places/' +
        this.selectedPlace.placeId + '/images/' + file.upload.uuid)
    },
    onAdded (file) {
      //this.savePlace()
      //setTimeout(() => this.$refs.myVueDropzone.processQueue(), 1000)
    },
    onSuccess() {
      this.$refs.myVueDropzone.removeAllFiles()
      setTimeout(this.updateImages, 10000)
    },
    removeImage(img) {
      var index = this.selectedPlace.images.indexOf(img);
      if (index > -1) {
        this.selectedPlace.images.splice(index, 1);
      }
    },
    updateImages() {
      this.setLoading(true)

      this.$api.getPlace(this.selectedPlace.placeId)
        .then(response => {
          this.selectedPlace.images = response.body.images
          this.setLoading(false)
          this.setSending(false)
        })
        .catch(err => console.error(err))
    }
  },
  watch: {
    '$route' (to, from) {
      this.init()
    }
  },
  mounted () {
    this.watchers.places = this.$store.watch(state => this.$store.state.places,
      (newValue, oldValue) => {
        this.init()
    })

    this.watchers.selectedPlace = this.$store.watch(state => this.$store.state.selectedPlace,
      (newValue, oldValue) => {
        if (newValue && newValue.coordinates) {
          this.selectedPlace.coordinates = newValue.coordinates
          this.getAddress()
        }
    })

    this.init()
  },
  beforeDestroy () {
    this.watchers.places()
    this.watchers.selectedPlace()
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit('deselectPlace')
    next()
  }
}
</script>

<style lang="scss" scoped>
.toolbar {
  position: fixed;
  width: 535px;
  overflow: hidden;
  margin: -20px;
  padding: 10px 20px;
  z-index: 10;

  h4 {
    text-align: center;
    line-height: 1.6;
  }
}

.toolbar-placeholder {
  height: 50px;
}

.place-form {
  padding: 20px;
}

.place-form .actions {
  text-align: right;
}

.md-progress-bar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 99;
}

.image-thumb {
  width: calc(100% / 3 - 20px);
  height: 100px;
  margin: 10px;
  float: left;
  background-size: cover;
  background-position: center;
  border-radius: 5px;
  cursor: move;
}

.image-remove {
  float: right;
  margin: 5px;
}

.input-disabled {
  background-color: #e9e9e9;
}
</style>
