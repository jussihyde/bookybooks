import { StatusBar } from 'expo-status-bar';
import * as React from 'react'
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, View } from 'react-native';
import { API_KEY } from'@env';
import { NavigationContainer } from'@react-navigation/native';
import { createBottomTabNavigator } from'@react-navigation/bottom-tabs';
import { Ionicons} from '@expo/vector-icons';
import { ListItem, Text } from'react-native-elements';
import * as SQLite from'expo-sqlite';

//creating tab navigator
const Tab = createBottomTabNavigator();

//setting imported api key
const KEY = API_KEY;

//opening database
const db = SQLite.openDatabase('booksdb.db');

function HomeScreen( {  route } ) {
  const {title} = route.params;
  const {author} = route.params;
  const {imageuri} = route.params;
  const {description} = route.params;
  const [books, setBooks] = useState([]);

  //creating table into the database
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists books (id integer primary key not null, title text, author text, imageuri text, description text);');
    }, null, updateList);
  }, []);

  //saving database items
  const saveItem = () => {
    db.transaction(tx => {
      tx.executeSql('insert into books (title, author, imageuri, description) values (?,?,?,?);', [title, author, imageuri, description]); 
    }, null, updateList);
  }

  //updating database items
  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from books;', [], (_, { rows }) =>
        setBooks(rows._array)
      );
    });
  }

  //deleting database items
  const deleteItem = (id) => {
    db.transaction( tx => {
      tx.executeSql('delete from books where id = ?;', [id]);
    }, null, updateList);
  }

  //adding book sent from toplist to states, and saving it to database
  useEffect(() => {
    if (title === "") {}
    else {
    setBooks(title, author, description, imageuri);
    saveItem()
    };
  }, [title]);

  const renderItem = ({ item }) => (
    <ListItem  onLongPress={() => {deleteItem(item.id)}}>
        <ListItem.Content >
          <ListItem.Title >{item.title}</ListItem.Title>
          <ListItem.Subtitle >{item.author}</ListItem.Subtitle>
          <ListItem.Subtitle >{item.description}</ListItem.Subtitle>
          <Image style={styles.logo} source={{uri: item.imageuri}}/>
          <ListItem.Subtitle ><Ionicons name="alert-circle-outline" color="red" />long press to delete</ListItem.Subtitle>
        </ListItem.Content>
    </ListItem>
  )

  return(
    <View>
      <FlatList
      keyExtractor={(item,index) => index.toString()} 
      renderItem={renderItem}
      data={books}
      ItemSeparatorComponent={listSeparator}
       
    />
    </View>
  );

}

function SettingsScreen( {  navigation  } ) {
  const [lists, setLists] = useState([]);

  //fetching list genres from api
  useEffect(() => {
      const getLists = async () => {
        const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${KEY}`)
        const json = await response.json();
        setLists(json.results);
      }
      getLists()
      .catch(console.error);
  }, [])

 const renderItem = ({ item }) => (
    <ListItem bottomDivider onPress={() => {navigation.navigate('Top Lists', {list: item.list_name_encoded});}}>
      <ListItem.Content>
        <ListItem.Title>{item.list_name}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  )

  return (
    <View>
      <FlatList
        keyExtractor={(item,index) => index.toString()}
        renderItem={renderItem}
        data={lists} 
        ItemSeparatorComponent={listSeparator}
        />
    </View>
  );
}

function ListsScreen({ route, navigation }) {
  const {list} = route.params;
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
  const [repositories, setRepositories] = useState([]);
  
  //fetching toplist from api, based on genre set in change genre tab
  useEffect(() => {
      const getRepositories = async () => {
        const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/${date}/${list}.json?api-key=${KEY}`)
        const json = await response.json();
        setRepositories(json.results.books);
        if (json.status === 'ERROR') {
          Alert.alert('List not found')
        }
      }
        getRepositories()
        .catch(console.error);
    }, [list])

  renderItem = ({ item }) => (
    <ListItem bottomDivider onPress={() => {navigation.navigate('My books', {title: item.title, author: item.author, description: item.description, imageuri: item.book_image });}}>
        <ListItem.Content>
          <ListItem.Title>{item.rank}. {item.title}</ListItem.Title>
          <ListItem.Subtitle >{item.author}</ListItem.Subtitle>
          <ListItem.Subtitle >{item.description}</ListItem.Subtitle>
          <Image style={styles.logo} source={{uri: item.book_image}}/>
        </ListItem.Content>
      </ListItem>
    )

  return (
    <View >
      <StatusBar hidden={true} />
      <Text h4 >{list.charAt(0).toUpperCase() + list.slice(1)}</Text>
      <FlatList
        keyExtractor={(item,index) => index.toString()}
        renderItem={renderItem}
        data={repositories} 
        ItemSeparatorComponent={listSeparator}
        />
      
    </View>
  );
}

//navigation component
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="My books" component={HomeScreen} initialParams={{title: ""}}/>
        <Tab.Screen name="Change Genre" component={SettingsScreen} />
        <Tab.Screen name="Top Lists" component={ListsScreen} initialParams={{list: "hardcover-fiction"}}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

//styling a gap between list items
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

//bottom tab navigator buttons with icons
const screenOptions = ({ route }) => ({
  tabBarIcon: ({ color, size }) => {
    let iconName;

    if (route.name === 'My books') {
      iconName = 'md-book-outline';
    } else if (route.name === 'Change Genre') {
      iconName = 'build-outline';
    } else if (route.name === 'Top Lists') {
      iconName = 'clipboard-outline';
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
    width: 65,
    height: 90,
  },
});
