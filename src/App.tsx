import React, {useState} from "react";
import {PartyInfo} from "./components/PartyInfo";
import {PartySearch} from "./components/PartySearch";

function App() {
    const [partyINN, setPartyINN] = useState(0);
    const [partyKPP, setPartyKPP] = useState(0);

    return (
        <div className="App">
            <PartySearch setPartyINN={(inn) => setPartyINN(inn)}
                         setPartyKPP={(kpp) => setPartyKPP(kpp)}
            />
            <PartyInfo partyINN={partyINN} partyKPP={partyKPP}/>
        </div>
    )
}

export default App