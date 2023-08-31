import React from 'react';
import {
 StyleSheet,
 Text,
 View,
 Dimensions,
 Image,
 Animated,
 PanResponder,
 Modal,
 TouchableOpacity,
} from 'react-native';

import { Feather as Icon } from "@expo/vector-icons";

import PropTypes from 'prop-types';

import api from '../../services/api';

import * as Permissions from 'expo-permissions';

import { Camera } from 'expo-camera';

import * as ImagePicker from 'expo-image-picker';

import {
  CancelButtonContainer,
  SelectButtonContainer,
  ButtonText,
  ModalContainer,
  ModalImagesListContainer,
  ModalImagesList,
  ModalImageItem,
  ModalButtons,
  CameraButtonContainer,
  CancelButtonText,
  ContinueButtonText,
  TakePictureButtonContainer,
  TakePictureButtonLabel,
  DataButtonsWrapper,
  Form,
  Input,
  DetailsModalFirstDivision,
  DetailsModalSecondDivision,
  DetailsModalBackButton,
  DetailsModalProfileTitle,
 } from './styles';

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width

/*const Profile = [
  {id:"1", name:"R6", uri: require('../../../assets/1.jpg')},
  {id:"2", name:"Hollow Knight", uri: require('../../../assets/2.jpg')},
  {id:"3", name:"Minecraft", uri: require('../../../assets/3.jpg')},
  {id:"4", name:"CSGO", uri: require('../../../assets/4.png')},
  {id:"5", name:"Halo", uri: require('../../../assets/5.jpg')},
]*/

export default class Main extends React.Component {
  static navigationOptions = {
    header:null,
  }
  
  static propTypes = {
    navigation: PropTypes.shape({
      state: PropTypes.shape({
        params: PropTypes.shape({
          token: PropTypes.string,
        }),
      }),
    }).isRequired,
  }

  constructor(){
    super();
    this.position = new Animated.ValueXY();
    this.state = {
      currentIndex: 0,
      profiles: [],
      likes: [],
      id_logado: 0,
      id_alvo: 0,
      id_alvo_backup: 0,
      name_logado:'',
      name_alvo:'',
      match: false,
      cameraModalOpened: false,
      dataModalOpened: false,
      detailsModalOpened: false,
      matchModalOpened: false,
      profileDetailed: null,
      profileData: {
        title: '',
        images: [],
      },
      hasCameraPermission: true,
      type: Camera.Constants.Type.back,
    }
  this.rotate = this.position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  })
  this.rotateAndTranslate = {
    transform: [{
      rotate: this.rotate
    },
    ...this.position.getTranslateTransform()
    ]
  }
  this.likeOpacity = this.position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp'
  })

  this.nopeOpacity = this.position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp'
  })

  this.nextCardOpacity = this.position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 1],
    extrapolate: 'clamp'
  })

  this.nextCardScale = this.position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: 'clamp'
  })


  }

  componentWillMount(){
    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        this.position.setValue({ x: gestureState.dx, y:gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        
        if (gestureState.dx > 120) {
          this.saveLike()
          Animated.spring(this.position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
            })
          })
        } else if (gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
            })
          })
        } else {
            Animated.spring(this.position, {
              toValue: { x: 0, y: 0 },
              friction: 5
            }).start()
        }
 
      }
    })
  }

  async componentDidMount() {
    this.getProfile();
    this.getLike();
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
 
  getProfile = async () => {
    try {
      const response = await api.get('/profile', {});
      this.setState({ profiles: response.data });
    } catch (err) {
      return err
    }
  }

  getLike = async () => {
    try {
      const response = await api.get('/like', {});
      this.setState({ likes: response.data[0] });
      this.setState({ id_logado: response.data[1].id })
      this.setState({ name_logado: response.data[1].username })
    } catch (err) {
      return err  
    }
  }

  setTarget (target, name) {
    if(this.state.match == false){
      this.setState({ id_alvo: target })
      this.setState({ name_alvo: name })
    } else {
      this.setState({ id_alvo_backup: target })
    }
  }

  saveLike = async () => {
    this.setState({ match: true })    
    try {
      const {
        id_logado,
        id_alvo,
      } = this.state;  
      await api.post('/like', {
         id_logado, id_alvo,        
      });
      this.getLike()
    } catch (err) {
      return err
    }
  }

  renderLike = () => {

    return this.state.likes.map ((item, i) => {
 
      if ( this.state.match )
      {
        if ( this.state.id_logado == item.id_alvo )
        {
          if ( this.state.id_alvo == item.id_logado )
          {
            return (
 
              <View key={item.id}>
                <Text
                  style={{
                    position: "absolute",
                    top: 40,
                    zIndex: 1000,
                    color: "white",
                    fontSize: 32,
                    fontWeight: "800",
                    alignSelf: "center",
                  }}
                >
                  {this.state.name_logado} e {this.state.name_alvo}
                </Text>
                <Image
                  style={{
                    height: SCREEN_HEIGHT - 120,
                    width: SCREEN_WIDTH,
                  }}
                  source={require('../../images/match.jpg')} resizeMode="contain"
                />
                <CancelButtonText onPress={() => this.closeMatch()}>Voltar</CancelButtonText>
              </View>
          
            )
          }
        }
      }
 
    })
 
  }

  closeMatch = () => {
    this.setState({ match: false })
    this.setState({ id_alvo: this.state.id_alvo_backup })
  }

  renderProfile = () => {
    return this.state.profiles.map ((item, i) => {
      if(i<this.state.currentIndex) {
        return null;
      }
      else if(i==this.state.currentIndex) {
      return (
        <Animated.View
          {...this.PanResponder.panHandlers}
          key={item.id}
            style = {[
              this.rotateAndTranslate, 
            {
              height: SCREEN_HEIGHT - 120,
              width: SCREEN_WIDTH,
              padding: 10,
              position: 'absolute'
            }
          ]}
        >
          <Animated.View
          style = {{
            opacity: this.likeOpacity,
            transform: [{rotate: "-30deg"}],
            position: "absolute",
            top: 50,
            left: 40,
            zIndex: 1000
          }}>
          <Text
          style = {{
            borderWidth: 4,
            borderColor: "green",
            color: "green",
            fontSize: 32,
            fontWeight: "800",
            padding: 10
          }}
          >LIKE</Text></Animated.View>
          <Animated.View style = {{
            opacity: this.nopeOpacity,
            transform: [{rotate: "30deg"}],
            position: "absolute",
            top: 50,
            right: 40,
            zIndex: 1000
          }}>
          <Text
          style ={{
            borderWidth: 4,
            borderColor: "red",
            color: "red",
            fontSize: 32,
            fontWeight: "800",
            padding: 10
          }}
          >NOPE</Text>
          </Animated.View>
          <Image
             style={{
               flex: 1,
               height: null,
               width: null,
               resizeMode: "cover",
               borderRadius: 20
             }}
             source={{ uri: `http://192.168.0.145:19000/images/${item.images[0].path}` }}
             onLoadStart={() => this.setTarget(item.user.id, item.user.username)}
           />
            <Text style={styles.name} onPress={() => this.handleDetailsModalClose(i)}>{item.title}</Text>
          </Animated.View>
        )
      }
      else {
        return (
          <Animated.View
            key={item.id}
              style = {[
              {
                oppacity: this.nextCardOpacity, 
                transform: [{scale: this.nextCardScale}],
                height: SCREEN_HEIGHT - 120,
                width: SCREEN_WIDTH,
                padding: 10,
                position: 'absolute'
              }
            ]}
          >
            <Image
              style = {{
                flex:1,
                height: null,
                width: null,
                resizeMode: "cover",
                borderRadius: 20
              }}
              source = {item.uri}
              />          
            </Animated.View>
          )
      }
    }).reverse();
  }

  renderCameraModal = () => (
    <Modal
      visible={this.state.cameraModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleCameraModalClose}
    >
      <ModalContainer>
        <ModalContainer>
          <View style={{ flex: 1 }}>
            <Camera style={{ flex: 1 }} type={this.state.type} ref={camera => {this.camera = camera;}} >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                }}>
                <TouchableOpacity
                  style={{
                    flex: 0.1,
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.setState({
                      type:
                        this.state.type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back,
                    });
                  }}>
                  <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
                </TouchableOpacity>
              </View>
            </Camera>
          </View>         
          <TakePictureButtonContainer onPress={this.handleTakePicture}>
            <TakePictureButtonLabel />
          </TakePictureButtonContainer>
        </ModalContainer>
        { this.renderImagesList() }
        <ModalButtons>
          <CameraButtonContainer onPress={this.handleCameraModalOpenClose}>
            <CancelButtonText>Cancelar</CancelButtonText>
          </CameraButtonContainer>
          <CameraButtonContainer onPress={this.handleDataModalClose}>
            <ContinueButtonText>Continuar</ContinueButtonText>
          </CameraButtonContainer>
        </ModalButtons>
 
      </ModalContainer>
    </Modal>
  )

  renderImagesList = () => (
    this.state.profileData.images.length !== 0 ? (
      <ModalImagesListContainer>
        <ModalImagesList horizontal>
          { this.state.profileData.images.map ((image, i) => (
            <ModalImageItem source={{ uri: image.uri }} key={i.toString()} resizeMode="stretch" />
          ))}
        </ModalImagesList>
      </ModalImagesListContainer>
    ) : null
  )

  renderDataModal = () => (
    <Modal
      visible={this.state.dataModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleDataModalClose}
    >
      <ModalContainer>
        <ModalContainer>
        </ModalContainer>
        { this.renderImagesList() }
        <Form>
          <Input
            placeholder="Título do Perfil"
            value={this.state.profileData.title}
            onChangeText={title => this.handleInputChange('title', title)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <DataButtonsWrapper>
            <SelectButtonContainer onPress={this.pickImage}>
              <ButtonText>Escolha uma imagem</ButtonText>           
            </SelectButtonContainer>
          </DataButtonsWrapper>
        </Form>
        <DataButtonsWrapper>
          <SelectButtonContainer onPress={this.saveProfile}>
            <ButtonText>Salvar Perfil</ButtonText>
          </SelectButtonContainer>
          <CancelButtonContainer onPress={this.handleDataModalClose}>
            <ButtonText>Cancelar</ButtonText>
          </CancelButtonContainer>
        </DataButtonsWrapper>
      </ModalContainer>
    </Modal>
  )

  renderDetailsModal = () => (
    <Modal
      visible={this.state.detailsModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleDetailsModalClose}
    >
      <ModalContainer>
        <DetailsModalFirstDivision>
          <DetailsModalBackButton onPress={() => this.handleDetailsModalClose(null)}>
            Voltar
          </DetailsModalBackButton>
        </DetailsModalFirstDivision>
        <DetailsModalSecondDivision>
          <DetailsModalProfileTitle>
            {this.state.detailsModalOpened
              ? this.state.profiles[this.state.profileDetailed].title
              : ''
            }
          </DetailsModalProfileTitle>
          { this.renderDetailsImagesList() }
        </DetailsModalSecondDivision>
      </ModalContainer>
    </Modal>
  )

  renderDetailsImagesList = () => (
    this.state.detailsModalOpened && (
      <ModalImagesList horizontal>
        { this.state.profiles[this.state.profileDetailed].images.map(image => (
          <ModalImageItem
            key={image.id}
            source={{ uri: `http://192.168.0.145:19000/images/${image.path}` }}
            resizeMode="stretch"
          />
        ))}
      </ModalImagesList>
    )
  )

  handleCameraModalOpenClose = () => this.setState({
    cameraModalOpened: !this.state.cameraModalOpened
  })

  handleTakePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true, forceUpOrientation: true, fixOrientation: true, };
      const data = await this.camera.takePictureAsync(options)
      const { profileData } = this.state;
      this.setState({ profileData: {
        ...profileData,
        images: [
          ...profileData.images,
          data,
        ]
      }})
    }
  }

  handleDataModalClose = () => this.setState({
    dataModalOpened: !this.state.dataModalOpened,
    cameraModalOpened: false,
  })

  handleInputChange = (index, value) => {
    const { profileData } = this.state;
    switch (index) {
      case 'title':
        this.setState({ profileData: {
          ...profileData,
          title: value,
        }});
        break;
    }
  }

  handleDetailsModalClose = i => this.setState({
    detailsModalOpened: !this.state.detailsModalOpened,
    profileDetailed: i,
  })
 
  pickImage = async () => {
    const options1 = { mediaTypes: ImagePicker.MediaTypeOptions.All, allowsEditing: true, aspect: [4, 3] }
    const data1 = await ImagePicker.launchImageLibraryAsync(options1)
    const { profileData } = this.state;
    this.setState({ profileData: {
      ...profileData,
      images: [
        ...profileData.images,
        data1,
      ]
    }})
  }

  saveProfile = async () => {
    try {
      const {
        profileData: {
          title,
          images
        }
      } = this.state;
 
      const newProfileResponse = await api.post('/profile', {
        title        
      });
      
      const imagesData = new FormData();
 
      images.forEach((image, index) => {
        imagesData.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `${newProfileResponse.data.title}_${index}.jpg`
        });
      });
 
      await api.post(
        `/profile/${newProfileResponse.data.id}/images`,
        imagesData,
      );
      
      this.getProfile()
      this.handleDataModalClose()
    } catch (err) {
      return(err);
    }
  }

  render(){
    return (
 
      <View style={{ flex: 1 }}>
        <View style={{ height: 60 }}>
 
          <View style={styles.header}>
            <Icon name="user" size={32} color="gray" onPress={this.handleCameraModalOpenClose}/>
            <Icon name="message-circle" size={32} color="gray" />
          </View>
 
        </View>
        <View style={{ flex: 1 }}>
 
          {this.renderProfile()}
          {this.renderLike()}
 
        </View>
        <View style={{ height: 60 }}>
 
          <View style={styles.footer}>
            <View style={styles.circle}>
              <Icon name="x" size={32} color="#ec5288" />
            </View>
            <View style={styles.circle}>
              <Icon name="heart" size={32} color="#6ee3b4" />
            </View>
          </View>
 
        </View>
                                 
                 {this.renderCameraModal()}
                 {this.renderDataModal()}
                 {this.renderDetailsModal()}
                 
      </View>
 
    );
  }
}

const styles = StyleSheet.create({
    header: {flexDirection:"row",
    justifyContent:"space-between",
    padding: 15, 
  },
    footer: {flexDirection:"row",
    justifyContent:"space-evenly",
    padding: 0, 
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "gray",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
  name: {
    color: "white",
    fontSize: 32,
    position: "absolute",
    padding: 20,
    fontWeight: "bold",
  },
});
