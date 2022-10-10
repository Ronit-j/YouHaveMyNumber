import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, Button, TouchableOpacity, Keyboard, AsyncStorage} from 'react-native';
import { useState, useEffect } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Contacts from 'expo-contacts';
// import { SafeAreaView} from 'react-navigation';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// import { UIProvider, Form } from 'react-native-web-jsonschema-form';

import { NavigationContainer} from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';


function HomeScreen({navigation}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned =  async ({ type, data }) => {
    setScanned(true);
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    const detailsArray = data.split(":");
    // check if last name equivalent is entered
    const fullName = detailsArray[0];
    const fullNameSplit = fullName.split(" ");
    console.log(fullNameSplit);

    if(fullNameSplit.length == 2){
      var firstName = fullNameSplit[0];
      var secondName = fullNameSplit[1];
    }
    else{
      var firstName = fullNameSplit[0];
    }
    console.log(detailsArray);
    if(detailsArray.length == 2 && detailsArray[0] != ""){
      const contact = {
        [Contacts.Fields.FirstName]: firstName,
        [Contacts.Fields.LastName]: secondName,
        [Contacts.Fields.PhoneNumbers]: [{number: detailsArray[1],
        isPrimary: true,
        digits: data,
        countryCode: "USA",
        id: "1",
        label: "main",}
      ]
  
      };
      try{
        const contactId = await Contacts.addContactAsync(contact);
        console.log(contactId);
        }
        catch(error){
          console.log(error);
        }
    }
    else{
      alert("Scanned QR code not valid");
    }
    
    
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaProvider>
    <SafeAreaView>
    <View style={{ alignItems: 'center', justifyContent: 'center'}}>
    <View style={styles.barCodeScannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned ? <Button title={'Tap to Scan'} style={{paddingTop:-100}} onPress={() => setScanned(false)} /> : null}
        
    </View>
    
    { !scanned ? <TouchableOpacity
      style={styles.stopScanButton}
      onPress={() => setScanned(true)}>
      <Text style={styles.saveButtonText}>Stop the scan</Text>
    </TouchableOpacity>: null}
  </View>
  </SafeAreaView>
  </SafeAreaProvider>
  );
}

function DetailsScreen() {
  const [text, onChangeText] = React.useState("Ronit Jorvekar");
  const [number, onChangeNumber] = React.useState("1231231234");
  const [numberValue, onChangeNumberValue] = React.useState("1231231234");
  // let numberValue="00000000";
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(true);
  useEffect(() => {
    load();
  }, [])
  const save = async () => {
    try {
        await AsyncStorage.setItem("Name", text);
        await AsyncStorage.setItem("Number", number);
    }
    catch(err){
      alert(err);
    }
  }
  const load = async () => {
    try {
        let name = await AsyncStorage.getItem("Name");
        let number = await AsyncStorage.getItem("Number");
        if(name != null) {
          onChangeText(name);
        }
        if(number != null) {
          onChangeNumber(number);
        }
        onChangeNumberValue(name + ':' + number);

    }
    catch(err){
      alert(err);
    }
  }
  let flag = 1;
  function changeFlag(){
    setScanned(false);
  }

  function checkifNull(details){
    console.log(details);
    if(details.number != "" && details.text != ""){
      onChangeNumberValue(details.text + ':' + details.number);
      console.log({numberValue});
    }
    else{
      onChangeNumberValue("0000000000");
      console.log({numberValue});
    }
  }
    return (
    <SafeAreaProvider>
      <SafeAreaView>
    <View>
    <ScrollView style = {{textAlign:"Center"}}>


    <View>
        <Text style={styles.informationText}> Enter your name</Text>
      </View>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder="Your name"
        onChangeText={onChangeText}
        value={text}
        maxLength={20}
        onBlur={Keyboard.dismiss}
      />
        <View>
        <Text style={styles.informationText}>Enter your Phone Number</Text>
      </View>
    </View>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        onChangeText={onChangeNumber}
        value={number}
        placeholder="1231321321"
        keyboardType="numeric"
      />
    </View>
  
    <View style={styles.inputContainer}>
    <TouchableOpacity
      style={styles.saveButton}
      onPress= {()=> {
      checkifNull({text, number});
      changeFlag();
      save();
    }}
    >
      <Text style={styles.saveButtonText}>Save</Text>
    </TouchableOpacity>
  </View>
      <View style={[styles.container, {
    // Try setting `flexDirection` to `"row"`.
    flexDirection: "column"
  
    }]}>
     
  
    <View
    style={{display:"flex", justifyContent:"center", flexDirection:"column", flexWrap:"nowrap", alignContent:"stretch", alignItems: "center" , height: 400}}>
    <QRCode
        style={{ alignItems: "center" , height: "inherit"}}
        value={numberValue}
        size={300}
      />
      </View>
      
  </View>
  </ScrollView>
  </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const Tab = createMaterialTopTabNavigator();

export default function App() {

  return (
    
    <SafeAreaProvider>
    
    
    <NavigationContainer>
      <Tab.Navigator style={{paddingTop: 30}} >

        <Tab.Screen name="Home" component={HomeScreen}
        options={{
          
          title: 'Scan Code',
          
        }} />
        <Tab.Screen name="Details" component={DetailsScreen}
        options={{
          title: 'Contact details',
        }}
        />
      </Tab.Navigator>
    </NavigationContainer>
    
    </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
  buttonToNavigate: {
    height: 500,
    width: 500,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 30,
    borderRadius: 6,

  },
  barCodeScannerContainer: {

    height: 500,
    width: 350,
    paddingTop: 400,
    marginTop:60,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 6,
    borderWidth:10
  },
  container: {
    // flex: 1,
    paddingTop: 25,
    backgroundColor: '#F5FCFF',
  },
  header: {
    width:"auto",
    fontSize: 25,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold'
  },
  titles:{
    fontSize: 25,
    margin: 10,
    fontWeight: 'bold',
    textAlign : 'center'
  },
  informationText:{
    fontSize: 22,
    marginTop: 10,
    // fontWeight: 'bold',
    textAlign : 'center'
  },
  inputContainer: {
    
    marginTop:20,
    paddingBottom: 5,
    height: 80,
    borderRadius: 6,
    fontSize: 20

  },
  textInput: {
    borderColor: '#CCCCCC',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    height: 50,
    fontSize: 25,
    textAlign: "center", 
    
  },
  saveButton: {
    borderWidth: 1,
    borderColor: '#2942CB' ,
    backgroundColor: '#2942CB' ,
    padding: 15,
    borderRadius: 6,
    width:350,
    marginTop:-20,
    marginLeft:38,

    margin: 5
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center'
  },
  stopScanButton:{
    paddingTop: 10,
    marginTop: 50,
    backgroundColor: '#5C72EB',
    padding: 15,
    textAlign: "center", 
    borderColor: '#CCCCCC',
    borderRadius: 6,
    margin: 5
  },
  stopScanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center'
  },
});
