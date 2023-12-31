import axios from 'axios';

import { AsyncStorage } from 'react-native';

const api = axios.create({
 baseURL: 'http://192.168.0.145:19000/',
});

api.interceptors.request.use(async (config) => {
 try {

   const token = await AsyncStorage.getItem('@token_key');


   if (token) {
     config.headers.Authorization = `Bearer ${token}`;
   }
   return config;

 } catch (err) {

   alert(err);

 }
});

export default api;
