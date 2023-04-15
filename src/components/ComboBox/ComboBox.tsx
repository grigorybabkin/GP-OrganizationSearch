import React, { useEffect, useState } from "react";
import styles from "./ComboBox.module.scss";

interface ComboBoxInterface {
    search_type: "inn" | "name" | "address";
    setPartyINN(inn: number): void;
    setPartyKPP(kpp: number): void;
}

interface Suggestion {
    data: {
        inn: number;
        kpp: number;
        name: {
            full_with_opf: string;
        }
        address: {
            value: string;
        }
        hid: number;
    }
}

function matchValues(inputValue: string, dataValue: string) {
    const cleanRegExp = RegExp(/[^a-zA-Zа-яА-Я0-9]/g);
    const cleanInputValue = inputValue.replace(cleanRegExp, "");
    const cleanDataValue = dataValue.replace(cleanRegExp, "");
    return RegExp(cleanInputValue, "gi").test(cleanDataValue)
}

function ComboBox(props: ComboBoxInterface) {
    const search_type = props.search_type != "inn" && props.search_type != "name" &&
    props.search_type != "address" ? "inn" : props.search_type;
    const placeholder_type = search_type == "inn" ? "ИНН" : search_type == "name" ? "названию" : "адресу";

    const [partySuggestions, setPartySuggestions] = useState<[Suggestion]>();
    const [inputValue, setInputValue] = useState("");
    const [open, setOpen] = useState(false);

    const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
    const token = "db1aaa57a20d27b703d4e290710a5798e4c08c81";
    const count = 20;

    const options: RequestInit = {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Token " + token
        },
        body: JSON.stringify({query: inputValue, count: count})
    };

    useEffect(() => {
        setOpen(inputValue != "")
    }, [inputValue]);

    useEffect(() => {
        fetch(url, options)
            .then(response => response.json())
            .then(result => setPartySuggestions(result.suggestions))
            .catch(error => console.log("error", error));
    }, [inputValue]);

    return (
        <div className={styles.container}>
            <div className={open ? styles.combobox_opened : styles.combobox_closed}>
                <input
                    type="text"
                    value={inputValue}
                    placeholder={"Поиск организаций по " + placeholder_type}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setOpen(true);
                    }}
                    onClick={() =>
                        (partySuggestions!.length > 0 ||
                            inputValue != "") &&
                        setOpen(!open)}
                />
                <ul>
                    {partySuggestions?.map((partySuggestion) =>
                        (search_type == "inn" && partySuggestion?.data?.inn
                            && matchValues(inputValue, partySuggestion.data.inn.toString()) ||
                            search_type == "name" && partySuggestion?.data?.name?.full_with_opf
                            && matchValues(inputValue, partySuggestion?.data.name.full_with_opf) ||
                            search_type == "address" && partySuggestion?.data?.address?.value
                            && matchValues(inputValue, partySuggestion?.data.address.value)) &&
                        <li
                            key={partySuggestion?.data.hid}
                            onClick={() => {
                                props.setPartyINN(partySuggestion?.data.inn);
                                props.setPartyKPP(partySuggestion?.data.kpp);
                                setInputValue("");
                            }}
                        >
                            {search_type == "inn"
                                ? partySuggestion?.data.inn + "  –  " + partySuggestion?.data.name.full_with_opf
                                : search_type == "name"
                                    ? partySuggestion?.data.name.full_with_opf
                                    : partySuggestion?.data.address.value}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

export { ComboBox }