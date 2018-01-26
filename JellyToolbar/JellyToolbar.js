import React from 'react';
import { StyleSheet, Text, TextInput, View, TouchableWithoutFeedback, Dimensions, Animated, Easing, Keyboard} from 'react-native';
import Svg, {Circle, Path, Defs, LinearGradient, Stop,} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Octicons';
import { WINDOW_W, WINDOW_H, StatusBarHeight, JellyViewHeight, OutJellyViewWidth, SearchIconSize, JellyAnimDuration, PrimaryColor, SecondaryColor } from './constants'
import {jellyExpandEasing, jellyCollapseEasing, bounceEasing} from './EasingFunction'

//Wrapping Svg.Path with createAnimatedComponent, for changing Path's d props value.
//Check https://facebook.github.io/react-native/docs/0.51/animated.html#animatable-components
let AnimatedPath = Animated.createAnimatedComponent(Path);

//default d value of AnimatedPath
const defaultJellyPath = `M${OutJellyViewWidth} 0 L${OutJellyViewWidth + WINDOW_W} 0 ${OutJellyViewWidth + WINDOW_W} ${JellyViewHeight} ${OutJellyViewWidth} ${JellyViewHeight} Q ${OutJellyViewWidth} ${JellyViewHeight/2} ${OutJellyViewWidth} 0`;

class JellyToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearching: false,
      isInputFilled: false,
    }
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
          `M${OutJellyViewWidth} 0
          L${OutJellyViewWidth + WINDOW_W} 0 ${OutJellyViewWidth + WINDOW_W} ${JellyViewHeight} ${OutJellyViewWidth} ${JellyViewHeight}
          Q ${OutJellyViewWidth - (isNaN(diff.value) ? (this.state.isSearching ? (JellyViewHeight - StatusBarHeight)/2 : -(JellyViewHeight - StatusBarHeight)/2) : diff.value)} ${JellyViewHeight/2} ${OutJellyViewWidth} 0`
        }
      );
    })
  }

  //Before animation started, checking whether user finished searching - if not, don't start animation.
  shouldComponentUpdate(nextProps, nextState) {
    return (nextState.isSearching != this.state.isSearching);
  }

  //As state is changed by events, determining what animation should be stared - search bar expanding, or collapsing
  componentDidUpdate() {
    this.state.isSearching ? this._jellyExpandAnimation() : this._jellyCollapseAnimation()
  }



  //jelly search bar expanding animation
  _jellyExpandAnimation() {
    this._cpX.setValue(0);
    Animated.parallel([
      Animated.timing(this._move,
      {
        toValue: -OutJellyViewWidth,
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
        toValue: (JellyViewHeight - StatusBarHeight)/2,
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
        toValue: (JellyViewHeight - StatusBarHeight)/2,
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

  //There are two main components I used for making jellyView - Svg.Path and Animated.View.
  //Svg.Path was used to make jelly-like movement and draw entire jelly search bar. this._cpX is value for this component.
  //Animated.View was used to move components including Path, textInput and other icons. this._move is value for this component.
  render() {
    return (
      <View>
        <View style={styles.header}>
          <View style={styles.menuIconWrap}>
            <Icon
              name='three-bars'
              size={SearchIconSize}
              color='#ffffff'/>
          </View>
          <Text style={styles.headerText}>News Feed</Text>
        </View>
        <Animated.View
          style={[styles.jellyView, {transform: [{translateX: this._move}]}]}>
          <Svg
            height={JellyViewHeight}
            width={WINDOW_W + OutJellyViewWidth}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2={WINDOW_W} y2="0">
                  <Stop offset="0" stopColor= {SecondaryColor} stopOpacity="1" />
                  <Stop offset="1" stopColor={PrimaryColor} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <AnimatedPath
              ref = {(ref) => this._myPath = ref}
              d={defaultJellyPath}
              fill="url(#grad)">
            </AnimatedPath>
          </Svg>
          <View style={styles.searchBarContainer}>
            <Animated.View
              style = {[styles.searchIconWrap, {opacity: this._searchFade}]}>
              <TouchableWithoutFeedback
                onPress = {() => this.setState({isSearching: true,})}
                disabled = {this.state.isSearching}>
                <Icon
                  name="search"
                  size={SearchIconSize}
                  color='#ffffff'>
                </Icon>
              </TouchableWithoutFeedback>
            </Animated.View>
            <TextInput
              ref = {(ref) => this._searchInput = ref}
              style = {styles.textInput}
              underlineColorAndroid = '#ffffff00'
              placeholder = {'Search...'}
              placeholderTextColor = '#ffffffaa'
              selectionColor = '#ffffff66'
              autoCorrect = {false}
              onChange = {() => this.setState({isInputFilled: true})}
              />
            <View style = {styles.closeIconWrap}>
              <TouchableWithoutFeedback
                onPress = {() => {this.state.isInputFilled ? this.clearInput() : this.closeInput()}}>
                <Icon
                  name="x"
                  size={SearchIconSize +4}
                  color='#ffffff'/>
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
    height: JellyViewHeight,
    width: WINDOW_W,
    backgroundColor: PrimaryColor,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: StatusBarHeight,
  },
  jellyView: {
    position: 'absolute',
    top:0,
    left:0,
  },
  menuIconWrap: {
    width: JellyViewHeight - StatusBarHeight,
    alignSelf: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchBarContainer: {
    height: JellyViewHeight - StatusBarHeight,
    width: WINDOW_W,
    position: 'absolute',
    top: StatusBarHeight,
    left: OutJellyViewWidth,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  searchIconWrap: {
    width: JellyViewHeight - StatusBarHeight,
    alignSelf: 'center',
    alignItems: 'center',
  },
  textInput: {
    width: WINDOW_W - 2 * (JellyViewHeight - StatusBarHeight),
    alignSelf: 'center',
    fontSize: 20,
    color: '#ffffff'
  },
  closeIconWrap: {
    width: JellyViewHeight - StatusBarHeight,
    alignSelf: 'center',
    alignItems: 'center',
  },
});

export default JellyToolbar;
