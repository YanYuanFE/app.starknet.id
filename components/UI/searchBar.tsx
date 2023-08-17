import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { TextField, styled } from "@mui/material";
import { FunctionComponent, useState } from "react";
import { useIsValid } from "../../hooks/naming";
import styles from "../../styles/search.module.css";
import SearchResult from "./searchResult";
import { useNamingContract } from "../../hooks/contracts";
import { utils } from "starknetid.js";

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    padding: "10px 35px",
    caretColor: "#454545",
    cursor: "pointer",
    "& fieldset": {
      border: "1px solid #CDCCCC",
      borderRadius: "20px",
      boxShadow: "0px 2px 30px 0px rgba(0, 0, 0, 0.06)",
      backgroundColor: "#FFFFFF",
      cursor: "pointer",
    },
    "& .MuiInputBase-input": {
      color: "#454545",
      fontSize: "24px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "24px",
      letterSpacing: "0.24px",
      textAlign: "center",
      zIndex: "1",
      cursor: "pointer",
    },
    "&:hover fieldset": {
      border: "1px solid #CDCCCC",
    },
    "& ::placeholder": {
      color: "#B0AEAE",
      textAlign: "center",
      fontSize: "24px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "24px",
      letterSpacing: "0.24px",
      justifyContent: "center",
      alignItems: "center",
    },
    "&.Mui-focused ::placeholder": {
      color: "transparent",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

type SearchBarProps = {
  onChangeTypedValue?: (typedValue: string) => void;
  showHistory: boolean;
};

const SearchBar: FunctionComponent<SearchBarProps> = ({
  onChangeTypedValue,
  showHistory,
}) => {
  const router = useRouter();
  const [typedValue, setTypedValue] = useState<string>("");
  const isDomainValid = useIsValid(typedValue);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { contract } = useNamingContract();

  useEffect(() => {
    if (!contract) return;
    const existingResults =
      JSON.parse(localStorage.getItem("search-history") as string) || [];
    const firstResults = existingResults.slice(0, 5);
    const resultPromises = firstResults.map(
      (result: { name: string; lastAccessed: number }) =>
        getStatus(result.name, result.lastAccessed)
    );
    Promise.all(resultPromises).then((fullResults) => {
      fullResults.sort(
        (a: SearchResult, b: SearchResult) => b.lastAccessed - a.lastAccessed
      );
      setSearchResults(fullResults);
    });
  }, [contract]);

  function handleChange(value: string) {
    setTypedValue(value.toLowerCase());
    getStatus(value).then((result) => {
      setCurrentResult(result);
    });
  }

  async function getStatus(
    name: string,
    lastAccessed?: number
  ): Promise<SearchResult> {
    const isDomainValid = useIsValid(name);
    if (isDomainValid !== true) {
      return {
        name,
        error: true,
        message: isDomainValid + " is not a valid caracter",
        lastAccessed: lastAccessed ?? Date.now(),
      };
    } else {
      const currentTimeStamp = new Date().getTime() / 1000;
      const encoded = name
        ? utils.encodeDomain(name).map((elem) => elem.toString())
        : [];
      return new Promise((resolve) => {
        contract?.call("domain_to_expiry", [encoded]).then((res) => {
          if (Number(res?.["expiry"]) < currentTimeStamp) {
            resolve({
              name,
              error: false,
              message: "Available",
              lastAccessed: lastAccessed ?? Date.now(),
            });
          } else {
            resolve({
              name,
              error: true,
              message: "Unavailable",
              lastAccessed: lastAccessed ?? Date.now(),
            });
          }
        });
      });
    }
  }

  function search(typedValue: string) {
    if (typeof isDomainValid === "boolean") {
      onChangeTypedValue?.(typedValue);
      saveSearch(currentResult as SearchResult);
      setCurrentResult(null);
      setTypedValue("");
      router.push(`/search?domain=${typedValue}`);
    }
  }

  function saveSearch(newResult: SearchResult) {
    setSearchResults((prevResults) => {
      const updatedResults = [...(prevResults || [])]; // Clone the previous results
      const existingResult = updatedResults.find(
        (result) => result.name === newResult.name
      );

      if (existingResult) {
        existingResult.lastAccessed = Date.now();
      } else {
        newResult.lastAccessed = Date.now();
        updatedResults.unshift(newResult);
      }

      updatedResults.sort((a, b) => b.lastAccessed - a.lastAccessed);
      const localStorageResults = updatedResults.map((result) => ({
        name: result.name,
        lastAccessed: result.lastAccessed,
      }));
      localStorage.setItem(
        "search-history",
        JSON.stringify(localStorageResults)
      );

      return updatedResults;
    });
  }

  return (
    <div className={styles.searchContainer}>
      <CustomTextField
        fullWidth
        id="outlined-basic"
        placeholder="Search your username"
        variant="outlined"
        onChange={(e) => handleChange(e.target.value)}
        value={typedValue}
        error={isDomainValid != true}
      />
      {typedValue.length > 0 || searchResults.length > 0 ? (
        <SearchResult
          currentResult={currentResult}
          history={searchResults}
          search={search}
          showHistory={showHistory}
        />
      ) : null}
    </div>
  );
};

export default SearchBar;
