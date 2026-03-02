// export default function CategoryPills({ items, active, onChange }) {
//   return (
//     <div className="flex gap-3 overflow-x-auto pb-2">
//       {items.map((item) => {
//         const isActive = active === item.id;

//         return (
//           <button
//             key={item.id}
//             onClick={() => onChange(item.id)}
//             className={`
//               flex flex-col items-center
//               min-w-[72px]
//               px-3 py-2
//               rounded-xl border transition
//               ${
//                 isActive
//                   ? "bg-green-50 border-green-600"
//                   : "bg-white border-gray-200 hover:bg-gray-50"
//               }
//             `}
//           >
//             {/* ICON */}
//             <div
//               className={`
//                 w-10 h-10 rounded-full
//                 flex items-center justify-center text-base
//                 ${
//                   isActive
//                     ? "bg-green-600 text-white"
//                     : "bg-gray-100 text-gray-700"
//                 }
//               `}
//             >
//               {item.icon}
//             </div>

//             {/* LABEL */}
//             <span className="text-[11px] mt-1 font-medium leading-tight">
//               {item.name}
//             </span>
//           </button>
//         );
//       })}
//     </div>
//   );
// }

export default function CategoryPills({ items, active, onChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {items.map((item) => {
        const isActive = active === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`
              flex flex-col items-center
              min-w-[72px]
              px-3 py-2
              rounded-xl border transition
              ${
                isActive
                  ? "bg-green-50 border-green-600"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }
            `}
          >
            {/* IMAGE */}
            <div
              className={`
                w-12 h-12 rounded-full
                overflow-hidden
                border
                ${isActive ? "border-green-600" : "border-gray-200"}
              `}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                  N/A
                </div>
              )}
            </div>

            {/* LABEL */}
            <span className="text-[11px] mt-2 font-medium leading-tight text-center">
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
