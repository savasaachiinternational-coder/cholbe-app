import {Image, StyleSheet, View, type ImageSourcePropType} from 'react-native';
import React from 'react';

type Props = {
  source: ImageSourcePropType;
};

export function PainBodyDiagram({source}: Props) {
  return (
    <View style={styles.container}>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
