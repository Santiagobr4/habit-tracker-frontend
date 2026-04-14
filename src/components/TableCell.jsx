import { getSymbol, getStatusStyle } from "../utils/habitHelpers";

export default function TableCell({ status, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`w-12 h-10 rounded-lg flex items-center justify-center transition shadow-sm ${
        status === "skip"
          ? "cursor-not-allowed"
          : "cursor-pointer hover:scale-105"
      } ${getStatusStyle(status)}`}
    >
      {getSymbol(status)}
    </div>
  );
}
