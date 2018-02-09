import React from 'react';
import { StyleSheet, View, StatusBar,} from 'react-native';
import JellyToolbar from 'react-native-jellytoolbar';
import Icon from 'react-native-vector-icons/Octicons';


class App extends React.Component {
  renderMenuIcon() {
    return(
      <Icon
        name='three-bars'
        size={26}
        color='#ffffff'/>
    );
  }

  renderOpenIcon() {
    return(
      <Icon
        name="search"
        size={26}
        color='#ffffff'>
      </Icon>
    );
  }

  renderCloseIcon() {
    return(
      <Icon
        name="x"
        size={30}
        color='#ffffff'/>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor= '#00000044'
          barStyle = 'light-content'/>
        <JellyToolbar
          isStatusBarTranslucent = {true}
          height = {80}
          tabWidth = {64}
          primaryColor = '#5B86E5'
          secondaryColor = '#36D1DC'
          headerText = {'Menu'}
          headerTextSize = {20}
          placeholder = {'Search'}
          inputTextSize = {20}
          menuIcon={this.renderMenuIcon()}
          openTabIcon={this.renderOpenIcon()}
          closeTabIcon={this.renderCloseIcon()}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
});

export default App;
