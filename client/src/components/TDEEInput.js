import React, { useState } from "react";
import {
  Grid,
  Segment,
  Input,
  Dropdown,
  Label,
  Button,
  GridRow,
  GridColumn,
} from "semantic-ui-react";
import { BASE_API_URL , activityLevelOptions , gainLoseOptions} from "../utils/constants";

function TDEEInput() {
 
  const [data, setData] = useState({});
  const [calculatedTDEEData, setCalculatedTDEEData] = useState({});
  const [caloriesData, setCaloriesData] = useState({});
  const [caloriesMessage, setCaloriesMessage] = useState("");
  const [items, setItems] = useState([{ itemName: "", calorie: "" }]);
  const [loadingTDEE, setLoadingTDEE] = useState(false);
  const [userName, setUserName] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const addItem = (e) => {
    setItems([...items, { itemName: "", calorie: "" }]);
  };

  const deletedItem = (index) => {
    if (items.length === 1) {
      return;
    }
    let temp = [...items];
    temp.splice(index, 1);
    setItems(temp);
  };

  const handleItemChange = (i, { name, value }) => {
    const temp = [...items];
    const currItem = { ...temp[i] };
    currItem[name] = value;
    temp[i] = currItem;
    setItems(temp);
  };

  const handleChange = (e, { name, value }) => {
    setData({ ...data, ...{ [name]: value } });
  };

  const handleCalorieChange = (e, { name, value }) => {
    setCaloriesData({ ...caloriesData, ...{ [name]: value } });
  };

  const handleTDEECalculate = () => {
    setLoadingTDEE(true);
    fetch(`${BASE_API_URL}/calculateTDEE`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoadingTDEE(false);
        setCalculatedTDEEData(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoadingTDEE(false);
      });
  };

  const handleCaloriesCheck = () => {
    const { weight, noOfMonths, type } = caloriesData;
    const caloriesPerKg = 7000; // acc to general rule of thumb in problem statement
    const totalCalories = caloriesPerKg * noOfMonths;
    const caloriesPerDay = (totalCalories / 30).toFixed(2); // 30 days
    if (type === "gain") {
      setCaloriesMessage(
        `You need to consume ${caloriesPerDay} calories per day to gain ${weight} kg weight in ${noOfMonths} months`
      );
    } else {
      setCaloriesMessage(
        `You need to burn ${caloriesPerDay} calories per day to lose ${weight} kg weight in ${noOfMonths} months`
      );
    }
  };

  const isCalculateDisabled = () => {
    if (data.weight && data.fat && data.activityLevel) {
      return false;
    }
    return true;
  };

  const isCheckDisabled = () => {
    if (caloriesData.weight && caloriesData.noOfMonths) {
      return false;
    }
    return true;
  };

  const getTotalCalories = (items) => {
    return items.map((i) => Number(i.calorie)).reduce((a, b) => a + b, 0);
  };

  const handleSubmit = () => {
    const data = {
      userName: userName,
      checkedCalorieData: caloriesData,
      items: items,
      calculatedTDEEData: calculatedTDEEData,
    };
    setLoadingSubmit(true);
    fetch(`${BASE_API_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoadingSubmit(false);
        setSubmitSuccess(true)
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 5000);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoadingSubmit(false);
      });
  };

  const blockInvalidChar = e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

  return (
    <Grid container>
      <Grid.Row>
        <Segment style={{ width: "63%" }}>
          <Label basic color="orange" className="dashboard-label">
            Calculate TDEE (Total Daily Energy Expenditure)
          </Label>
          <Grid columns="equal">
            <Grid.Column style={{ display: "grid" }}>
              <label className="custom-lable">Weight</label>
              <Input
                label={{ basic: true, content: "kg" }}
                labelPosition="right"
                type="number"
                name="weight"
                onKeyDown={blockInvalidChar}
                value={data.weight || ""}
                onChange={handleChange}
                placeholder="Enter weight..."
              />
            </Grid.Column>
            <Grid.Column style={{ display: "grid" }}>
              <label className="custom-lable">Fat</label>
              <Input
                label={{ basic: true, content: "%" }}
                labelPosition="right"
                name="fat"
                type="number"
                onKeyDown={blockInvalidChar}
                value={data.fat || ""}
                onChange={handleChange}
                placeholder="Enter fat..."
              />
            </Grid.Column>
            <Grid.Column style={{ display: "grid" }}>
              <label className="custom-lable">Activity level</label>
              <Dropdown
                placeholder="Select activity level..."
                closeOnBlur
                name="activityLevel"
                value={data.activityLevel || ""}
                onChange={handleChange}
                selection
                options={activityLevelOptions}
              />
            </Grid.Column>
          </Grid>
          <Grid.Row className="submit-button">
            {calculatedTDEEData.data && (
              <div  style={{ width: "50%" }}>
                <Label
                  style={{ border: "none" }}
                  basic
                  color="orange"
                  className="dashboard-label"
                >
                  {`TDEE (Total Daily Energy Expenditure): ${calculatedTDEEData.data.TDEE}`}
                </Label>
                <Label
                  style={{ border: "none" }}
                  basic
                  color="orange"
                  className="dashboard-label"
                >
                  {`BMR (Basal Metabolic Rate): ${calculatedTDEEData.data.BMR}`}
                </Label>
              </div>
            )}
            <Button
              disabled={isCalculateDisabled()}
              loading={loadingTDEE}
              style={{ marginLeft: "auto" ,maxHeight: '36px' }}
              onClick={handleTDEECalculate}
            >
              {" "}
              Calculate
            </Button>
          </Grid.Row>
        </Segment>
      </Grid.Row>

      <Grid.Row>
        <Segment style={{ width: "63%" }}>
          <Label basic color="orange" className="dashboard-label">
            Check below how much calories per day you need to consume/burn to achive your health goals
          </Label>
          <Grid columns="equal">
            <Grid.Column style={{ display: "grid" }}>
              <label className="custom-lable">Weight</label>
              <Input
                label={{ basic: true, content: "kg" }}
                labelPosition="right"
                name="weight"
                type="number"
                onKeyDown={blockInvalidChar}
                value={caloriesData.weight || ""}
                onChange={handleCalorieChange}
                placeholder="Enter weight..."
              />
            </Grid.Column>
            <Grid.Column style={{ display: "grid" }}>
              <label className="custom-lable">Number of months</label>
              <Input
                label={{ basic: true, content: "M" }}
                value={caloriesData.noOfMonths || ""}
                name="noOfMonths"
                onChange={handleCalorieChange}
                labelPosition="right"
                onKeyDown={blockInvalidChar}
                type="number"
                placeholder="Number of months..."
              />
            </Grid.Column>
            <Grid.Column style={{ display: "grid" }}>
              <label className="custom-lable">Gain/Lose</label>
              <Dropdown
                placeholder="Select gain/Lose..."
                closeOnBlur
                name="type"
                value={caloriesData.type || "gain"}
                onChange={handleCalorieChange}
                selection
                options={gainLoseOptions}
              />
            </Grid.Column>
          </Grid>

          <Grid.Row className="submit-button">
            {caloriesMessage && (
              <Grid.Column>
                <Grid.Row>
                  <Label
                    style={{ border: "none" }}
                    basic
                    color="orange"
                    className="dashboard-label"
                  >
                    {caloriesMessage}
                  </Label>
                </Grid.Row>
              </Grid.Column>
            )}
            <Button
              style={{ marginLeft: "auto" }}
              disabled={isCheckDisabled()}
              onClick={handleCaloriesCheck}
            >
              Check
            </Button>
          </Grid.Row>
        </Segment>
      </Grid.Row>
      <Grid.Row>
        <Segment style={{ width: "63%" }}>
          <Label basic color="orange" className="dashboard-label">
            Calories Counter
          </Label>
          <Grid>
            <GridColumn width={4} style={{ display: "grid" }}>
              <label className="custom-lable">Item</label>
            </GridColumn>
            <GridColumn width={4} style={{ display: "grid" }}>
              <label className="custom-lable">Calorie</label>
            </GridColumn>
            <GridColumn width={4} style={{ display: "grid" }}></GridColumn>
            <GridColumn width={4} style={{ display: "grid" }}>
              <Label
                style={{ border: "none" }}
                basic
                color="orange"
                className="dashboard-label"
              >
                {`Total Calories: ${getTotalCalories(items)}`}
              </Label>
            </GridColumn>
          </Grid>
          {items.map((i, index) => (
            <Grid key={index}>
              <GridColumn width={4} style={{ display: "grid" }}>
                <Input
                  name="itemName"
                  type="text"
                  value={i.itemName || ""}
                  onChange={(e, _obj) => handleItemChange(index, _obj)}
                  placeholder="Enter Item Name..."
                />
              </GridColumn>
              <GridColumn width={4} style={{ display: "grid" }}>
                <Input
                  name="calorie"
                  type="number"
                  onKeyDown={blockInvalidChar}
                  value={i.calorie || ""}
                  onChange={(e, _obj) =>handleItemChange(index, _obj)}
                  placeholder="Enter calorie..."
                />
              </GridColumn>
              <GridColumn width={4} style={{ display: "grid" }}>
                <Button
                  basic
                  icon="delete"
                  onClick={() => deletedItem(index)}
                ></Button>
              </GridColumn>
            </Grid>
          ))}
          <GridRow style={{ textAlign: "center", margin: "25px" }}>
            <Button onClick={addItem}>Add</Button>
          </GridRow>
          <hr />
          <Grid.Row className="submit-button">
            <Input
              name="userName"
              style={{ width: "50%" }}
              type="text"
              value={userName || ""}
              onChange={(e, { value }) => setUserName(value)}
              placeholder="Enter your name..."
            />
            {submitSuccess && <Label
              style={{ border: "none" }}
              basic
              color="orange"
              className="dashboard-label"
            >
              Data Saved Successfully 😃
            </Label>}
            <Button loading={loadingSubmit} disabled={!userName} onClick={handleSubmit}>
              Submit
            </Button>
          </Grid.Row>
        </Segment>
      </Grid.Row>
    </Grid>
  );
}

export default TDEEInput;
