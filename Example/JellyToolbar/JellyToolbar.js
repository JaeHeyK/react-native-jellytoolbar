import React from 'react';
import { StyleSheet, Text, TextInput, View, TouchableWithoutFeedback, Dimensions, Animated, Keyboard, StatusBar, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { jellyExpandEasing, jellyCollapseEasing, bounceEasing } from './EasingFunction';
import PropTypes from 'prop-types';

var WINDOW_W = Dimensions.get('window').width;
const JellyAnimDuration = 1100;

//Wrapping Svg.Path with createAnimatedComponent, for changing Path's d props value.
//Check https://facebook.github.io/react-native/docs/0.51/animated.html#animatable-components
let AnimatedPath = Animated.createAnimatedComponent(Path);

class JellyToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearching: false,
      isInputFilled: false,
    };
  }

  static propTypes = {
    height: PropTypes.number.isRequired,
    tabWidth: PropTypes.number.isRequired,
    isStatusBarTranslucent: PropTypes.bool,
    primaryColor: PropTypes.string.isRequired,
    secondaryColor: PropTypes.string.isRequired,
    headerText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    headerTextSize: PropTypes.number.isRequired,
    placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inputTextSize: PropTypes.number.isRequired,
    menuIcon: PropTypes.element,
    openTabIcon: PropTypes.element,
    closeTabIcon: PropTypes.element,
  }

  static defaultProps = {
    isStatusBarTranslucent: false,
    headerText: 'Header Text',
    placeholder: 'Search...',
  }

  componentWillMount() {
    this._move = new Animated.Value(0); //translation value of jelly search bar
    this._cpX = new Animated.Value(0); //X coordinate value of quadratic bezier curve's(jelly curve) control point(jelly curve)
    this._searchFade = new Animated.Value(1); //opacity of search icon

    //Getting animted value _cpX and using this as part of AnimatedPath's d props. Check https://medium.com/@ethantran/animating-svg-in-react-native-cf1907831608
    //When jellyEasing function returns 1 (or -1, in case of jellyCollapseEasing), sometimes diff.value returns NaN(don't know why, but maybe related to Animated API).
    //so I use conditional operator to solve this error.
    this._cpX.addListener((diff) => {
      this._myPath.setNativeProps(
        {d:
          `M${WINDOW_W - this.props.tabWidth} 0
          L${WINDOW_W - this.props.tabWidth + WINDOW_W} 0 ${WINDOW_W - this.props.tabWidth + WINDOW_W} ${this.props.height} ${WINDOW_W - this.props.tabWidth} ${this.props.height}
          Q ${WINDOW_W - this.props.tabWidth - (isNaN(diff.value) ? (this.state.isSearching ? this.props.tabWidth/2 : -this.props.tabWidth/2 ) : diff.value)} ${this.props.height/2} ${WINDOW_W - this.props.tabWidth} 0`
        }
      );
    })
  }

  //Before animation started, checking whether user finished searching - if not, don't start neither expanding nor collapsing animation.
  shouldComponentUpdate(nextProps, nextState) {
    return (nextState.isSearching != this.state.isSearching);
  }

  //Because states are changed by events, determining what animation should be stared - search bar expanding, or collapsing
  componentDidUpdate() {
    this.state.isSearching ? this._jellyExpandAnimation() : this._jellyCollapseAnimation()
  }

  //jelly search bar expanding animation
  _jellyExpandAnimation() {
    this._cpX.setValue(0);
    Animated.parallel([
      Animated.timing(this._move,
      {
        toValue: -(WINDOW_W - this.props.tabWidth),
        duration: JellyAnimDuration/3 + 250,
        easing: bounceEasing
      }),
      Animated.timing(this._searchFade,
      {
        toValue: 0.6,
        duration: JellyAnimDuration/3 + 250,
      }),
      Animated.timing(this._cpX,
      {
        toValue: this.props.tabWidth/2,
        duration: JellyAnimDuration,
        easing: jellyExpandEasing
      }),
    ]).start(() => {
      this._cpX.setValue(0)
    });
  }

  //jelly searchbar collapsing animation
  _jellyCollapseAnimation() {
    Animated.parallel([
      Animated.timing(this._move,
      {
        toValue: 0,
        duration: JellyAnimDuration/3 + 250,
        easing: bounceEasing
      }),
      Animated.timing(this._searchFade,
      {
        toValue: 1,
        duration: JellyAnimDuration/3 + 250,
      }),
      Animated.timing(this._cpX,
      {
        toValue: this.props.tabWidth/2,
        duration: JellyAnimDuration,
        easing: jellyCollapseEasing
      }),
    ]).start(() => {
      this._cpX.setValue(0)
    });
  }

  //when search bar is opened(isSearching: true), and textInput is filled, clearing textInput and changing input state - collapsing do not start.
  clearInput() {
    this._searchInput.clear();
    this.setState({isInputFilled: false});
  }

  //when search bar is opened, and textInput is not filled, dismissing Keyboard and changing searching state - collapsing starts!
  closeInput() {
    Keyboard.dismiss();
    this.setState({isSearching: false});
  }

  renderEmptyTab() {
    return (
      <View style={{height: this.props.height - (Platform.OS === 'android' ? (this.props.isStatusBarTranslucent ? StatusBar.currentHeight : 0) : (Dimensions.get('window').height == 812 ? 44 : 20)), width: this.props.tabWidth}}/>
    );
  }

  //There are two main components I used for making jellyView - Svg.Path and Animated.View.
  //Svg.Path was used to make jelly-like movement and draw entire jelly search bar. this._cpX is value for this component.
  //Animated.View was used to move components including Path, textInput and other icons. this._move is value for this component.
  render() {
    return (
      <View>
        <View style={[styles.header, {height: this.props.height, backgroundColor: this.props.primaryColor,   paddingTop: (Platform.OS === 'android' ? (this.props.isStatusBarTranslucent ? StatusBar.currentHeight : 0) : (Dimensions.get('window').height == 812 ? 44 : 20)),}]}>
          <View style={[styles.menuIconWrap, {width: this.props.tabWidth,}]}>
            {this.props.menuIcon ? this.props.menuIcon : this.renderEmptyTab()}
          </View>
          <Text style={[styles.headerText, {fontSize: this.props.headerTextSize,}]}>{this.props.headerText}</Text>
        </View>
        <Animated.View
          style={[styles.jellyView, {transform: [{translateX: this._move}]}]}>
          <Svg
            height={this.props.height}
            width={WINDOW_W + WINDOW_W - this.props.tabWidth}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2={WINDOW_W} y2="0">
                  <Stop offset="0" stopColor= {this.props.secondaryColor} stopOpacity="1" />
                  <Stop offset="1" stopColor={this.props.primaryColor} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <AnimatedPath
              ref = {(ref) => this._myPath = ref}
              d={`M${WINDOW_W - this.props.tabWidth} 0 L${WINDOW_W - this.props.tabWidth + WINDOW_W} 0 ${WINDOW_W - this.props.tabWidth + WINDOW_W} ${this.props.height} ${WINDOW_W - this.props.tabWidth} ${this.props.height} Q ${WINDOW_W - this.props.tabWidth} ${this.props.height/2} ${WINDOW_W - this.props.tabWidth} 0`}
              fill="url(#grad)">
            </AnimatedPath>
          </Svg>
          <View style={[styles.searchBarContainer, {height: this.props.height - (Platform.OS === 'android' ? (this.props.isStatusBarTranslucent ? StatusBar.currentHeight : 0) : (Dimensions.get('window').height == 812 ? 44 : 20)), top: (Platform.OS === 'android' ? (this.props.isStatusBarTranslucent ? StatusBar.currentHeight : 0) : (Dimensions.get('window').height == 812 ? 44 : 20)), left: WINDOW_W - this.props.tabWidth,}]}>
            <Animated.View
              style = {[styles.searchIconWrap, {width: this.props.tabWidth, opacity: this._searchFade}]}>
              <TouchableWithoutFeedback
                onPress = {() => this.setState({isSearching: true,})}
                disabled = {this.state.isSearching}>
                {this.props.openTabIcon ? this.props.openTabIcon : this.renderEmptyTab()}
              </TouchableWithoutFeedback>
            </Animated.View>
            <TextInput
              ref = {(ref) => this._searchInput = ref}
              style = {[styles.textInput, {width: WINDOW_W - (2 * this.props.tabWidth), fontSize: this.props.inputTextSize}]}
              underlineColorAndroid = '#ffffff00'
              placeholder = {this.props.placeholder}
              placeholderTextColor = '#ffffffaa'
              selectionColor = '#ffffff66'
              autoCorrect = {false}
              onChange = {() => this.setState({isInputFilled: true})}
              />
            <View style = {[styles.closeIconWrap, {width: this.props.tabWidth}]}>
              <TouchableWithoutFeedback
                onPress = {() => {this.state.isInputFilled ? this.clearInput() : this.closeInput()}}>
                {this.props.closeTabIcon ? this.props.closeTabIcon : this.renderEmptyTab()}
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WINDOW_W,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  jellyView: {
    position: 'absolute',
    top:0,
    left:0,
  },
  menuIconWrap: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchBarContainer: {
    width: WINDOW_W,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  searchIconWrap: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  textInput: {
    alignSelf: 'center',
    color: '#ffffff'
  },
  closeIconWrap: {
    alignSelf: 'center',
    alignItems: 'center',
  },
});

export default JellyToolbar;
