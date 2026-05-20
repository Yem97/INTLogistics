import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PawPrint } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PetsPage() {
  const pets = await prisma.pet.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Pets</h1>
        <p className="text-gray-500 mt-1">Find your perfect companion and have them safely delivered to you</p>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-24">
          <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No pets available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="h-48 bg-emerald-50 flex items-center justify-center">
                {pet.images[0] ? (
                  <img src={pet.images[0]} alt={pet.name} className="h-full w-full object-cover" />
                ) : (
                  <PawPrint className="w-16 h-16 text-emerald-200" />
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{pet.name}</h3>
                  <span className="text-emerald-700 font-bold">{formatCurrency(pet.price)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{pet.breed} · {pet.species}</p>
                <p className="text-sm text-gray-500 mb-3">{pet.age} · {pet.gender} · {pet.color}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{pet.description}</p>
                <Link
                  href={`/pets/${pet.id}`}
                  className="block text-center bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
