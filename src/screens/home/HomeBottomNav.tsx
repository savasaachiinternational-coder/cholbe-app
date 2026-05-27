import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {BOTTOM_TABS, type BottomTabKey} from './homeData';

const ACTIVE_COLOR = '#14B8A6';
const INACTIVE_COLOR = '#94A3B8';

type Props = {
  activeTab: BottomTabKey;
  bottomInset: number;
  onTabPress: (tab: BottomTabKey) => void;
};

export function HomeBottomNav({activeTab, bottomInset, onTabPress}: Props) {
  return (
    <View style={[styles.bar, {paddingBottom: Math.max(bottomInset, 8)}]}>
      {BOTTOM_TABS.map(tab => {
        const active = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.key)}>
            <Feather
              name={tab.icon}
              size={22}
              color={active ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    minHeight: 72,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: INACTIVE_COLOR,
    marginTop: 4,
  },
  tabLabelActive: {
    color: ACTIVE_COLOR,
    fontWeight: '600',
  },
});
