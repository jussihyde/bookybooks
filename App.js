import { StatusBar } from 'expo-status-bar';
import * as React from 'react'
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_KEY } from'@env';
import { NavigationContainer } from'@react-navigation/native';
import { createBottomTabNavigator } from'@react-navigation/bottom-tabs';
import { Ionicons} from '@expo/vector-icons';
import { Input, ListItem } from'react-native-elements';
import * as SQLite from'expo-sqlite';

const Tab = createBottomTabNavigator();

const KEY = API_KEY;

const db = SQLite.openDatabase('booksdb.db');


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
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [imageuri, setImageuri] = useState('');
  const [description, setDescription] = useState('');
  const [books, setBooks] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists books (id integer primary key not null, title text, author text, imageuri text, description text);');
    }, null, updateList);
  }, []);

  const saveItem = () => {
    db.transaction(tx => {
      tx.executeSql('insert into books (title, author, imageuri, description) values (?,?,?,?);', [title, author, imageuri, description]); 
    }, null, updateList);
  }

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from books;', [], (_, { rows }) =>
        setBooks(rows._array)
      );
    });
  }

  const deleteItem = (id) => {
    db.transaction( tx => {
      tx.executeSql('delete from books where id = ?;', [id]);
    }, null, updateList);
  }

  const renderItem = ({ item }) => (
    <ListItem onLongPress={() => {deleteItem(item.id)}}>
        <ListItem.Content >
          <ListItem.Title >{item.title}</ListItem.Title>
          <ListItem.Subtitle >{item.author}</ListItem.Subtitle>
          <ListItem.Subtitle >{item.description}</ListItem.Subtitle>
          <Image style={styles.logo} source={{uri: item.imageuri}}/>
        </ListItem.Content>
    </ListItem>
  )

  return(
    <View>
      <Input placeholder='title' label='PLACEFINDER' style={{ marginTop: 5, marginBottom: 5,  fontSize:15, width: 200}}
      onChangeText={(title) => setTitle(title)}
      value={title}/>
      <Input placeholder='author' label='PLACEFINDER' style={{ marginTop: 5, marginBottom: 5,  fontSize:15, width: 200}}
      onChangeText={(author) => setAuthor(author)}
      value={author}/>
      <Input placeholder='imageuri' label='PLACEFINDER' style={{ marginTop: 5, marginBottom: 5,  fontSize:15, width: 200}}
      onChangeText={(imageuri) => setImageuri(imageuri)}
      value={imageuri}/>
      <Input placeholder='description' label='PLACEFINDER' style={{ marginTop: 5, marginBottom: 5,  fontSize:15, width: 200}}
      onChangeText={(description) => setDescription(description)}
      value={description}/>
      <Button raised icon={{name: 'save', color: 'white'}} onPress={saveItem} title="SAVE" />
      <FlatList
      keyExtractor={item => item.id.toString()} 
      renderItem={renderItem}
      data={books} 
       
    />
    </View>
  );

}

function SettingsScreen( {navigation} ) {
  const [lists, setLists] = useState([]);
  const [genre, setGenre] = useState('');

  useEffect(() => {
      const getLists = async () => {
        const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${KEY}`)
        const json = await response.json();
        setLists(json.results);
      }
      getLists()
      .catch(console.error);
  }, [])

  useEffect(() => {
    setGenre(genre)
  }, [genre])
  

  renderItem = ({ item }) => (
    <ListItem bottomDivider onPress={() => {setGenre(item.list_name_encoded); navigation.navigate('Lists', {list: item.list_name_encoded});}}>
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

function ListsScreen({ route }) {
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
  

  const getRepositories = async () => {
    try {
    const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/${date}/${list}.json?api-key=${KEY}
    `)
      const data = await response.json();
      setRepositories(data.results.books)
      //console.log(data)
      if (data.status === 'ERROR') {
        Alert.alert('List not found')
      }
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
      
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Change Genre" component={SettingsScreen} />
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
    } else if (route.name === 'Change Genre') {
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
