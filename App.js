import React from 'react';
import { StyleSheet, View, StatusBar,} from 'react-native';
import JellyToolbar from './JellyToolbar/JellyToolbar';

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor= '#00000044'
          barStyle = 'light-content'/>
        <JellyToolbar/>
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
