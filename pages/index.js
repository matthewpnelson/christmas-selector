import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { getNamesData } from "../libs/sheets";
import { useState, useEffect } from "react";
import seedrandom from "seedrandom";

function splitUserData(userData) {
  let nameList = [];
  let oneAgoList = [];
  let twoAgoList = [];
  let partnerList = [];
  for (let i = 0; i < userData.length; i++) {
    nameList.push(userData[i].name);
    oneAgoList.push(userData[i].oneAgo);
    twoAgoList.push(userData[i].twoAgo);
    partnerList.push(userData[i].partner);
  }
  return [nameList, oneAgoList, twoAgoList, partnerList];
}

export default function Home({ userData }) {
  const [nameList, oneAgoList, twoAgoList, partnerList] =
    splitUserData(userData);

  // define a react state for the random seed
  const [randomSeed, setRandomSeed] = useState(0);
  // define a react state to hold the results of the random name selection
  const [randomNames, setRandomNames] = useState([]);
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
  const checkForMatch = (list, list1, list2, list3, list4) => {
    // loop through the list
    for (let i = 0; i < list.length; i++) {
      // check if the item at the current index matches the item at the same index in any of the other lists
      if (
        list[i] === list1[i] ||
        list[i] === list2[i] ||
        list[i] === list3[i] ||
        list[i] === list4[i]
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
    if (randomSeed !== 0) {
      const results = randomSelect(nameList, randomSeed);
      setRandomNames(results);
    }
  }, [randomSeed]);

  // useEffect to check if the random selection has a match when randomNames changes, and update the random seed if there is a match
  useEffect(() => {
    if (
      checkForMatch(randomNames, nameList, oneAgoList, twoAgoList, partnerList)
    ) {
      // set random seed using Math.random()
      const newSeed = Math.floor(Math.random() * 1000000);
      setRandomSeed(newSeed);
      setNumber(newSeed);
    }
  }, [randomNames]);

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
            Randomly Generated Gift Recipients for 2022
          </code>
        </p>

        <div className={styles.grid}>
          {/* Show resulting randomly generated list */}
          <div className={styles.card}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>

                  <th className={styles.th}>Buys For</th>
                  <th className={styles.th}>2021 Check</th>
                  <th className={styles.th}>2020 Check</th>
                  <th className={styles.th}>Partner Check</th>
                  <th className={styles.th}>Self Check</th>
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
                            : oneAgoList[index] && randomSeed !== 0 && " - ✔︎"}
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
                            : twoAgoList[index] && randomSeed !== 0 && " - ✔︎"}
                        </span>
                      </td>

                      <td>
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
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className={styles.description}>
            <span className={styles.muted}>Made with ❤️ by Matthew</span>
          </p>
        </div>
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
  return {
    props: {
      userData: names.slice(1, names.length), // remove sheet header
    },
    revalidate: 1, // In seconds
  };
}
