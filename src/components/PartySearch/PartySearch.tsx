import React from "react";
import styles from "./PartySearch.module.scss";
import { ComboBox } from "../ComboBox";

interface PartySearchInterface {
    setPartyINN(inn: number): void;
    setPartyKPP(kpp: number): void;
}

function PartySearch(props: PartySearchInterface) {
    return (
        <div className={styles.container}>
            <ComboBox search_type={"inn"}
                      setPartyINN={(inn) => props.setPartyINN(inn)}
                      setPartyKPP={kpp => props.setPartyKPP(kpp)} />
            <ComboBox search_type={"name"}
                      setPartyINN={inn => props.setPartyINN(inn)}
                      setPartyKPP={kpp => props.setPartyKPP(kpp)} />
            <ComboBox search_type={"address"}
                      setPartyINN={inn => props.setPartyINN(inn)}
                      setPartyKPP={kpp => props.setPartyKPP(kpp)} />
        </div>
    )
}

export { PartySearch }