import { StatusBar } from 'expo-status-bar';
import * as React from 'react'
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_KEY } from'@env';
import { NavigationContainer } from'@react-navigation/native';
import { createBottomTabNavigator } from'@react-navigation/bottom-tabs';
import { Ionicons} from '@expo/vector-icons'; 

const Tab = createBottomTabNavigator();

const KEY = API_KEY;

const listSeparator = () => {
  return (
      <View
        style={{
          height: 1,
          width: "80%",
          backgroundColor: "#CED0CE",
          marginLeft: "10%"
          }}
        />
   );
  };

function HomeScreen() {
  //fetching current date, and making the format correct, used for lists
  const getCurrentDate = () => {
    var date = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();

    if (date < 10) {
      return year + '-' + month + '-0' + date;
    }
    else {
      return year + '-' + month + '-' + date; 
  };
  }

  const date = getCurrentDate();
  const [list, setList] = useState('');
  const [repositories, setRepositories] = useState([]);
  

  const getRepositories = async () => {
    try {
    const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/${date}/${list}.json?api-key=${KEY}
    `)
      const data = await response.json();
      setRepositories(data.results.books)
     } catch(error) {
        Alert.alert('Error:', error.message)
        };
      };

  
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <FlatList
        keyExtractor={(item,index) => index.toString()}
        renderItem={({item}) =>
        <View>
          <Text style={{fontSize:18, fontWeight: "bold"}}>{item.rank}</Text>
          <Text style={{fontSize:18, fontWeight: "bold"}}>{item.title}</Text>
          <Text style={{fontSize:18, fontWeight: "bold"}}>{item.author}</Text>
          <Image style={styles.logo} source={{uri: item.book_image}}/>
        </View> }
        data={repositories} 
        ItemSeparatorComponent={listSeparator}
        />
        <Button title="Find" onPress= {getRepositories} />
        <TextInput style={{fontSize:18, width:200}} placeholder='list' onChangeText={text => setList(text) } />
      
    </View>
  );
}

function SettingsScreen() {
  const [lists, setLists] = useState([]);

  useEffect(() => {
      const getLists = async () => {
        const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${KEY}`)
        const json = await response.json();
        setLists(json.results);
      }
      getLists()
      .catch(console.error);
  }, [])

  return (
    <View style={styles.container}>
      <FlatList
        keyExtractor={(item,index) => index.toString()}
        renderItem={({item}) =>
        <View>
          <Text style={{fontSize:18, fontWeight: "bold"}}>{item.list_name}</Text>
        </View> }
        data={lists} 
        ItemSeparatorComponent={listSeparator}
        />
    </View>
  );
}

function ListsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings!</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Lists" component={ListsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const screenOptions = ({ route }) => ({
  tabBarIcon: ({ focused, color, size }) => {
    let iconName;

    if (route.name === 'Home') {
      iconName = 'md-home';
    } else if (route.name === 'Settings') {
      iconName = 'md-settings';
    } else if (route.name === 'Lists') {
      iconName = 'md-list';
    }

    return <Ionicons name={iconName} size={size} color={color} />;
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    alignItems: 'flex-end',
    width: 66,
    height: 58,
  },
});
