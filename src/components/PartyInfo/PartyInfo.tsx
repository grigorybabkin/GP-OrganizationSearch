import React, { useEffect, useState } from "react";
import styles from "./PartyInfo.module.scss";

interface PartyInfoProps {
    partyINN: number;
    partyKPP: number;
}

interface PartyInfo {
    data: {
        inn: number;
        kpp: number;
        name: {
            full_with_opf: string;
        }
        address: {
            value: string;
        }
        state: {
            status: "ACTIVE" | "LIQUIDATING" | "LIQUIDATED" | "BANKRUPT" | "REORGANIZING";
            registration_date: number | null;
            liquidation_date: number | null;
        }
        fio: {
            surname: string;
            name: string;
            patronymic: string;
        }
        branch_type: "MAIN" | "BRANCH";
        branch_count: number;
        hid: number;
    }
}

function formatDate(date: number) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    return [day, month, year].join('/');
}

function PartyInfo(props: PartyInfoProps) {
    const [selectedPartyINN, setSelectedPartyINN] = useState(props.partyINN);
    const [selectedPartyKPP, setSelectedPartyKPP] = useState(props.partyKPP);
    const [partyInfo, setPartyInfo] = useState<PartyInfo>();
    const [branchesInfo, setBranchesInfo] = useState<[PartyInfo]>();
    const [branchQueryType, setBranchQueryType] = useState("");

    const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
    const token = "db1aaa57a20d27b703d4e290710a5798e4c08c81";
    const count = 20;

    const options_party_info: RequestInit = {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Token " + token
        },
        body: JSON.stringify({query: selectedPartyINN, kpp: selectedPartyKPP})
    };
    const options_branches_info: RequestInit = {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Token " + token
        },
        body: JSON.stringify({query: selectedPartyINN, count: count, branch_type: branchQueryType})
    };

    useEffect(() => {
        setSelectedPartyINN(props.partyINN);
        setSelectedPartyKPP(props.partyKPP);
    }, [props.partyINN, props.partyKPP]);

    useEffect(() => {
        fetch(url, options_party_info)
            .then(response => response.json())
            .then(result => setPartyInfo(result.suggestions[0]))
            .catch(error => console.log("error", error));
        setBranchQueryType("");
    }, [selectedPartyINN, selectedPartyKPP]);

    useEffect(() => {
        partyInfo?.data?.branch_type &&
        setBranchQueryType(partyInfo?.data.branch_type == "MAIN" ? "BRANCH" : "MAIN");
    }, [partyInfo]);

    useEffect(() => {
        branchQueryType.length > 0 &&
        fetch(url, options_branches_info)
            .then(response => response.json())
            .then(result => setBranchesInfo(result.suggestions))
            .catch(error => console.log("error", error))
    }, [branchQueryType]);

    return (
        <div className={styles.container}>
            {!partyInfo
                ? <div className={styles.no_party_message}>
                    <h1>Здесь будет отображаться информация о найденной организации</h1>
                </div>
                : <div className={styles.party_info}>
                    <div className={styles.party_info__header}>
                        Информация о найденной организации:
                    </div>
                    <div className={styles.party_info__grid_view}>
                        <div className={styles.party_info__property_name}>ИНН:</div>
                        <div>{partyInfo?.data.inn}</div>

                        <div className={styles.party_info__property_name}>Наименование:</div>
                        <div>{partyInfo?.data.name.full_with_opf}</div>

                        <div className={styles.party_info__property_name}>Адрес:</div>
                        <div>
                            {partyInfo?.data?.address?.value && partyInfo?.data?.address?.value
                                || "информация отсутствует"}
                        </div>

                        <div className={styles.party_info__property_name}>Статус:</div>
                        <div>{partyInfo?.data?.state?.status &&
                            (partyInfo?.data.state.status == "ACTIVE" ? "Действующая"
                                : partyInfo?.data.state.status == "LIQUIDATING" ? "Ликвидируется"
                                    : partyInfo?.data.state.status == "LIQUIDATED" ? "Ликвидирована"
                                        : partyInfo?.data.state.status == "BANKRUPT" ? "Банкротство"
                                            : "В процессе присоединения к другому юрлицу, с последующей ликвидацией")
                            || "информация отсутствует"
                        }
                        </div>

                        <div className={styles.party_info__property_name}>Дата основания:</div>
                        <div>{partyInfo?.data?.state?.registration_date &&
                            formatDate(partyInfo?.data.state.registration_date) ||
                            "информация отсутствует"}</div>

                        <div className={styles.party_info__property_name}>Дата ликвидации:</div>
                        <div>{partyInfo?.data?.state?.liquidation_date &&
                            formatDate(partyInfo?.data.state.liquidation_date) ||
                            "информация отсутствует"}</div>

                        <div className={styles.party_info__property_name}>Тип организации:</div>
                        <div>{partyInfo?.data?.branch_type &&
                            (partyInfo?.data.branch_type == "MAIN"
                                ? "Головная организация"
                                : "Филиал") || "информация отсутствует"}
                        </div>

                        {partyInfo?.data?.branch_type &&
                            (partyInfo?.data?.branch_type == "MAIN" && partyInfo?.data?.branch_count > 0
                                || partyInfo?.data?.branch_type == "BRANCH") &&
                            <>
                                <div className={styles.party_info__property_name}>
                                    {partyInfo?.data?.branch_type == "MAIN" ? "Филиалы:" : "Головная организация:"}
                                </div>
                                <div>
                                    {branchesInfo?.map((branch) =>
                                        <span key={branch.data.hid}
                                              className={styles.party_info__branches}
                                              onClick={() => {
                                                  setSelectedPartyINN(branch.data.inn);
                                                  setSelectedPartyKPP(branch.data.kpp);
                                              }
                                              }>{branch.data.name.full_with_opf}<br/></span>
                                    )}
                                </div>
                            </>
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export { PartyInfo }