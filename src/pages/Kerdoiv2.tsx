import Kerdoiv from "./Kerdoiv";

export default function Kerdoiv2() {
  return (
    <Kerdoiv
      surveyId={2}
      sheetName="kerdoiv2"
      title="Kérdőív 2"
      showOwners={false}
      showBeneficiaries={false}
      showFileUpload={false}
      showConsents={true}
    />
  );
}
