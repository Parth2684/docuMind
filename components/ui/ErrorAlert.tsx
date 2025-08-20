


export default function ErrorAlert ({ error }: { error: string }) {
    return (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
    );
}