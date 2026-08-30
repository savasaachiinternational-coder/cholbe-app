import {Image, StyleSheet, View, type ImageSourcePropType} from 'react-native';
import React from 'react';

type Props = {
  source: ImageSourcePropType;
};

function PainBodyDiagramBase({source}: Props) {
  return (
    <View style={styles.container}>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
}

export const PainBodyDiagram = React.memo(PainBodyDiagramBase);

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
