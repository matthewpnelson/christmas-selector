import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { getNamesData, getKidsData } from "../libs/sheets";
import { useState, useEffect } from "react";
import seedrandom from "seedrandom";

function splitUserData(userData) {
  let nameList = [];
  let oneAgoList = [];
  let twoAgoList = [];
  let threeAgoList = [];
  let partnerList = [];
  for (let i = 0; i < userData.length; i++) {
    nameList.push(userData[i].name);
    oneAgoList.push(userData[i].oneAgo);
    twoAgoList.push(userData[i].twoAgo);
    threeAgoList.push(userData[i].threeAgo);
    partnerList.push(userData[i].partner);
  }
  return [nameList, oneAgoList, twoAgoList, threeAgoList, partnerList];
}

function splitKidsList(kidsData) {
  let nameList = [];
  let oneAgoList = [];
  let twoAgoList = [];
  let siblingOneList = [];
  let siblingTwoList = [];
  for (let i = 0; i < kidsData.length; i++) {
    nameList.push(kidsData[i].name);
    oneAgoList.push(kidsData[i].oneAgo);
    twoAgoList.push(kidsData[i].twoAgo);
    siblingOneList.push(kidsData[i].siblingOne);
    siblingTwoList.push(kidsData[i].siblingTwo);
  }
  return [nameList, oneAgoList, twoAgoList, siblingOneList, siblingTwoList];
}

export default function Home({ userData, kidsData }) {
  const [list, setList] = useState("adults");

  const toggleList = () => {
    if (list === "adults") {
      setList("kids");
    } else {
      setList("adults");
    }
  };

  const [nameList, oneAgoList, twoAgoList, threeAgoList, partnerList] =
    splitUserData(userData);

  const [
    kidsNameList,
    kidsOneAgoList,
    kidsTwoAgoList,
    kidsSiblingOneList,
    kidsSiblingTwoList,
  ] = splitKidsList(kidsData);

  // define a react state for the random seed
  const [randomSeed, setRandomSeed] = useState(0);
  // define a react state to hold the results of the random name selection
  const [randomNames, setRandomNames] = useState([]);
  const [randomKidsNames, setRandomKidsNames] = useState([]);
  // define a react state to hold a number
  const [number, setNumber] = useState(0);

  // define a function to update the random seed using an input field
  const updateRandomSeed = (e) => {
    setRandomSeed(e.target.value);
  };

  // define a function to update a number using an input field
  const updateNumber = (e) => {
    setNumber(e.target.value);
  };

  // update the random seed with the updateNumberwhen a button is pressed
  const updateRandomSeedWithNumber = () => {
    console.log(number);
    setRandomSeed(number);
  };

  // randomly select from a list of names without replacement
  // returns a list of names
  // takes a list, and a random seed as input
  const randomSelect = (list, seed) => {
    // create a new random number generator using the seed
    // convert seed to string to avoid errors
    // const rng = seedrandom(randomSeed.toString());
    const rng = seedrandom(seed.toString());
    console.log(seed);
    // create a copy of the list
    let listCopy = [...list];
    // create a new list to hold the results
    let results = [];
    // loop through the list
    for (let i = 0; i < list.length; i++) {
      // get a random index from the list
      let randomIndex = Math.floor(rng() * listCopy.length);
      // add the item at that index to the results list
      results.push(listCopy[randomIndex]);
      // remove the item at that index from the list
      listCopy.splice(randomIndex, 1);
    }
    // return the results
    return results;
  };

  // define a function to check if each item in one list matches the item at the same index of any of four other lists
  // returns true if there is a match, false if there is not
  // takes a list, and three other lists as input
  const checkForMatch = (list, list1, list2, list3, list4, list5) => {
    // loop through the list
    for (let i = 0; i < list.length; i++) {
      // check if the item at the current index matches the item at the same index in any of the other lists
      if (
        list[i] === list1[i] ||
        list[i] === list2[i] ||
        list[i] === list3[i] ||
        list[i] === list4[i] ||
        list[i] === list5[i]
      ) {
        // if there is a match, return true
        return true;
      }
    }
    // if there is no match, return false
    return false;
  };

  // useEffect to run the random selection and update randomusers when the random seed changes
  useEffect(() => {
    if (list === "adults") {
      if (randomSeed !== 0) {
        const results = randomSelect(nameList, randomSeed);
        setRandomNames(results);
      }
    } else {
      if (randomSeed !== 0) {
        const results = randomSelect(kidsNameList, randomSeed);
        setRandomKidsNames(results);
      }
    }
  }, [randomSeed]);

  // useEffect to check if the random selection has a match when randomNames changes, and update the random seed if there is a match
  useEffect(() => {
    if (list === "adults") {
      if (
        checkForMatch(
          randomNames,
          nameList,
          oneAgoList,
          twoAgoList,
          threeAgoList,
          partnerList
        )
      ) {
        // set random seed using Math.random()
        const newSeed = Math.floor(Math.random() * 1000000);
        setRandomSeed(newSeed);
        setNumber(newSeed);
      }
    } else {
      if (
        checkForMatch(
          randomKidsNames,
          kidsNameList,
          kidsOneAgoList,
          kidsTwoAgoList,
          kidsSiblingOneList,
          kidsSiblingTwoList
        )
      ) {
        // set random seed using Math.random()
        const newSeed = Math.floor(Math.random() * 1000000);
        setRandomSeed(newSeed);
        setNumber(newSeed);
      }
    }
  }, [randomNames, randomKidsNames, list]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Nelson Family Holidays</title>
        <meta name="description" content="Our holiday gift giving guide" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Nelson Holiday <a href="#">Buying Guide</a>
        </h1>

        <p className={styles.description}>
          <code className={styles.code}>
            Randomly Generated Gift Recipients for {new Date().getFullYear()}
          </code>
          {/* Two buttons to switch between Adults or kids Lists  */}
          <br />
          <button
            className={styles.button}
            style={{ marginTop: "40px" }}
            onClick={() => toggleList()}
          >
            {list === "adults" ? "View Kids List" : "View Adults List"}
          </button>
        </p>

        {list === "adults" ? (
          <div className={styles.grid}>
            {/* Show resulting randomly generated list */}
            <div className={styles.card}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Name</th>

                    <th className={styles.th}>Buys For</th>
                    <th className={styles.th}>
                      {new Date().getFullYear() - 1}
                    </th>
                    <th className={styles.th}>
                      {" "}
                      {new Date().getFullYear() - 2}
                    </th>
                    <th className={styles.th}>
                      {" "}
                      {new Date().getFullYear() - 3}
                    </th>
                    {/* <th className={styles.th}>Partner Check</th>
                  <th className={styles.th}>Self Check</th> */}
                  </tr>
                </thead>
                <tbody>
                  {/* show the original list of user names in column one of a table, and the randomly generated list in column two */}
                  {userData &&
                    userData.map((user, index) => (
                      <tr key={user.name}>
                        <td>{user.name}</td>
                        <td>{randomNames[index]}</td>
                        <td>
                          {oneAgoList[index]}
                          <span
                            className={
                              oneAgoList[index] === randomNames[index]
                                ? styles.textMatch
                                : styles.textNoMatch
                            }
                          >
                            {oneAgoList[index] === randomNames[index]
                              ? " - 𐄂"
                              : oneAgoList[index] &&
                                randomSeed !== 0 &&
                                " - ✔︎"}
                          </span>
                        </td>
                        <td>
                          {twoAgoList[index]}
                          <span
                            className={
                              twoAgoList[index] === randomNames[index]
                                ? styles.textMatch
                                : styles.textNoMatch
                            }
                          >
                            {twoAgoList[index] === randomNames[index]
                              ? " - 𐄂"
                              : twoAgoList[index] &&
                                randomSeed !== 0 &&
                                " - ✔︎"}
                          </span>
                        </td>
                        <td>
                          {threeAgoList[index]}
                          <span
                            className={
                              threeAgoList[index] === randomNames[index]
                                ? styles.textMatch
                                : styles.textNoMatch
                            }
                          >
                            {threeAgoList[index] === randomNames[index]
                              ? " - 𐄂"
                              : threeAgoList[index] &&
                                randomSeed !== 0 &&
                                " - ✔︎"}
                          </span>
                        </td>
                        {/* <td>
                        {partnerList[index]}
                        <span
                          className={
                            partnerList[index] === randomNames[index]
                              ? styles.textMatch
                              : styles.textNoMatch
                          }
                        >
                          {partnerList[index] === randomNames[index]
                            ? " - 𐄂"
                            : partnerList[index] && randomSeed !== 0 && " - ✔︎"}
                        </span>
                      </td>
                      <td>
                        {nameList[index]}
                        <span
                          className={
                            nameList[index] === randomNames[index]
                              ? styles.textMatch
                              : styles.textNoMatch
                          }
                        >
                          {nameList[index] === randomNames[index]
                            ? " - 𐄂"
                            : nameList[index] && randomSeed !== 0 && " - ✔︎"}
                        </span>
                      </td> */}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className={styles.description}>
              <span className={styles.muted}>
                Randomly chooses a recipient while avoiding puchasing for
                yourself, your partner, or anyone you bought for in the last 3
                years.
              </span>
              <br />
              <span className={styles.muted}>Made with ❤️ by Matthew</span>
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* Show resulting randomly generated list */}
            <div className={styles.card}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Name</th>

                    <th className={styles.th}>Buys For</th>
                    <th className={styles.th}>
                      {new Date().getFullYear() - 1}
                    </th>
                    <th className={styles.th}>
                      {" "}
                      {new Date().getFullYear() - 2}
                    </th>
                    {/* <th className={styles.th}>
                      {" "}
                      {new Date().getFullYear() - 3}
                    </th> */}
                    {/* <th className={styles.th}>Partner Check</th>
                  <th className={styles.th}>Self Check</th> */}
                  </tr>
                </thead>
                <tbody>
                  {/* show the original list of user names in column one of a table, and the randomly generated list in column two */}
                  {kidsData &&
                    kidsData.map((user, index) => (
                      <tr key={user.name}>
                        <td>{user.name}</td>
                        <td>{randomKidsNames[index]}</td>
                        <td>
                          {kidsOneAgoList[index]}
                          <span
                            className={
                              kidsOneAgoList[index] === randomKidsNames[index]
                                ? styles.textMatch
                                : styles.textNoMatch
                            }
                          >
                            {kidsOneAgoList[index] === randomKidsNames[index]
                              ? " - 𐄂"
                              : kidsOneAgoList[index] &&
                                randomSeed !== 0 &&
                                " - ✔︎"}
                          </span>
                        </td>
                        <td>
                          {kidsTwoAgoList[index]}
                          <span
                            className={
                              kidsTwoAgoList[index] === randomKidsNames[index]
                                ? styles.textMatch
                                : styles.textNoMatch
                            }
                          >
                            {kidsTwoAgoList[index] === randomKidsNames[index]
                              ? " - 𐄂"
                              : kidsTwoAgoList[index] &&
                                randomSeed !== 0 &&
                                " - ✔︎"}
                          </span>
                        </td>
                        {/* <td>
                          {kidsSiblingOneList[index]}
                          <span
                            className={
                              kidsSiblingOneList[index] === randomNames[index]
                                ? styles.textMatch
                                : styles.textNoMatch
                            }
                          >
                            {kidsSiblingOneList[index] === randomNames[index]
                              ? " - 𐄂"
                              : kidsSiblingOneList[index] &&
                                randomSeed !== 0 &&
                                " - ✔︎"}
                          </span>
                        </td> */}
                        {/* <td>
                        {partnerList[index]}
                        <span
                          className={
                            partnerList[index] === randomNames[index]
                              ? styles.textMatch
                              : styles.textNoMatch
                          }
                        >
                          {partnerList[index] === randomNames[index]
                            ? " - 𐄂"
                            : partnerList[index] && randomSeed !== 0 && " - ✔︎"}
                        </span>
                      </td>
                      <td>
                        {nameList[index]}
                        <span
                          className={
                            nameList[index] === randomNames[index]
                              ? styles.textMatch
                              : styles.textNoMatch
                          }
                        >
                          {nameList[index] === randomNames[index]
                            ? " - 𐄂"
                            : nameList[index] && randomSeed !== 0 && " - ✔︎"}
                        </span>
                      </td> */}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className={styles.description}>
              <span className={styles.muted}>
                Randomly chooses a recipient while avoiding puchasing for
                yourself, your partner (or sibling), or anyone you bought for in
                the last 3 years.
              </span>
              <br />
              <span className={styles.muted}>Made with ❤️ by Matthew</span>
            </p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <h4>Random Seed &rarr;</h4>
        <p> Use these fields to generate a new list</p>
        <p>
          <input
            className={styles.input}
            type="text"
            value={number}
            onChange={updateNumber}
          />
        </p>
        <p>
          <button
            className={styles.button}
            onClick={() => {
              updateRandomSeedWithNumber();
            }}
          >
            Set Start Seed Manually
          </button>
        </p>
        <p>
          <button
            className={styles.secondaryButton}
            onClick={() => {
              setRandomSeed(Math.floor(Math.random() * 1000000));
            }}
          >
            Generate Random Start Seed
          </button>
        </p>
      </footer>
    </div>
  );
}

export async function getStaticProps(context) {
  const names = await getNamesData();
  const kids = await getKidsData();
  return {
    props: {
      userData: names.slice(1, names.length), // remove sheet header
      kidsData: kids.slice(1, kids.length), // remove sheet header
    },
    revalidate: 1, // In seconds
  };
}
