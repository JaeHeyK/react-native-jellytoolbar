import { Dimensions } from 'react-native';

export var WINDOW_W = Dimensions.get('window').width;
export var WINDOW_H = Dimensions.get('window').height;
export const StatusBarHeight = 24;
export const JellyViewHeight = 80;
export const OutJellyViewWidth = WINDOW_W - (JellyViewHeight - StatusBarHeight);
export const SearchIconSize = 26;
export const JellyAnimDuration = 1100;

export const PrimaryColor = '#5b86e5';
export const SecondaryColor = '#36d1dc'
