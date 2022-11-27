BookyBooks on sovellus, johon voi luoda oman listauksen kirjoista. Kiinnostavia kirjoja voi kirjakategoria kerrallaan etsiä New York Times Books API:n kautta haettuja New York Times Best Sellers listauksien avulla.

sovelluksessa käytettyjä teknologioita: 
home-screen: SQLite tietokanta, Listaus tietokannassa olevista kirjoista, saa tallennettavien kirjojen tiedot list-screenilta. react-native-elements ListItem listatyyli.
settings-screen: API haku, NYT Books API: kirjakategorioiden haku, löydettyjen kategorioiden listaaminen, react-native-elements ListItem listatyyli. ListItemiä painamalla Navigation funktio siirtää näkymän list-screeniin, lähettäen listatyypin mukanaan.
lists-screen: Top Listan listaus list-screeniltä route.parameterinä saadun kirjakategorian perusteella automaattisesti. react-native-elements ListItem listatyyli. ListItemiä painamalla Navigation funktio siirtää näkymän home-screeniin, lähettäen kirjan tiedot tallennettaviksi.
