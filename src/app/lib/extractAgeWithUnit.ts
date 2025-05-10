export default function extractAge(ageString: string) {
  if (!ageString || typeof ageString !== "string" || ageString.length < 2) {
    return { value: null, unit: null };
  }

  const unitChar = ageString.slice(-1).toUpperCase(); // Get the last character and make it uppercase
  const numericalPart = ageString.slice(0, -1); // Get the part before the last character

  if (!/^\d+$/.test(numericalPart)) {
    return { value: null, unit: null };
  }

  const ageValue = parseInt(numericalPart, 10);

  let ageUnit = null;
  switch (unitChar) {
    case "Y":
      ageUnit = "years";
      break;
    case "M":
      ageUnit = "months";
      break;
    case "W":
      ageUnit = "weeks";
      break;
    case "D":
      ageUnit = "days";
      break;
    default:
      return { value: ageValue, unit: null };
  }

  return { value: ageValue, unit: ageUnit };
}
