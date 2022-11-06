import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_KEY } from'@env';

export default function App() {
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
  const KEY = API_KEY;

  const getRepositories = async () => {
    try {
    const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/${date}/${list}.json?api-key=${KEY}
    `)
      const data = await response.json();
      setRepositories(data.results.books)
      console.log(data)
     } catch(error) {
        Alert.alert('Error:', error.message)
        };
      };

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
        </View> }
        data={repositories} 
        ItemSeparatorComponent={listSeparator}
        />
        <Button title="Find" onPress= {getRepositories} />
        <TextInput style={{fontSize:18, width:200}} placeholder='list' onChangeText={text => setList(text) } />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 66,
    height: 58,
  },
});
