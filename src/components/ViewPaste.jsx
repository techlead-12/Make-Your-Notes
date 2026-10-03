import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

const ViewPaste = () => {
  const { id } = useParams();
  const paste = useSelector((state) =>
    state.paste.pastes.find((item) => item._id === id)
  );

  if (!paste) {
    return (
      <div className="mx-auto mt-8 max-w-3xl px-4">
        <p className="text-gray-600">Paste not found.</p>
        <Link className="text-blue-600 hover:underline" to="/pastes">
          Back to pastes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-3xl px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{paste.title}</h1>
        <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs uppercase text-gray-600">
          {paste.type ?? "text"}{paste.language ? `: ${paste.language}` : ""}
        </span>
      </div>
      <pre className={`mt-4 overflow-x-auto rounded-2xl border p-4 whitespace-pre-wrap ${
        paste.type === "code"
          ? "border-slate-700 bg-slate-950 font-mono text-green-300"
          : "border-gray-300"
      }`}>
        {paste.content}
      </pre>
    </div>
  )
}

export default ViewPaste
