import{createAppContainer} from 'react-navigation';
import{createStackNavigator} from 'react-navigation-stack';
import SignIn from './src/pages/signIn';
/*import SignUp from '.src/pages/signUp';*/
import Main from '.src/pages/main';

const AppNavigator = createAppContainer (
    createStackNavigator ({
      SignIn: SignIn,
      /*SignUp: SignUp,*/
      Main: Main,
    })
);
export default AppNavigator;