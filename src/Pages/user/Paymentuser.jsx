import React from 'react'
import Usersidebar from '../../Components/Usersidebar'

const Paymentuser = () => {
  return (
    <div>
       <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Usersidebar />

      {/* Payment Content */}
      <main className="flex-1 p-8 space-y-6">
        <h2 className="text-2xl font-semibold">Payment Methods</h2>

        {/* Current Payment */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Current Payment Method</h3>
            <span className="text-green-600 text-sm font-medium">
              Active
            </span>
          </div>

          <p className="text-sm text-gray-700">
            💳 <b>Visa</b> ending **** 4242 <br />
            Expiry: 09/27
          </p>

          <button className="mt-4 text-blue-600 hover:underline">
            Change Payment Method
          </button>
        </div>

        {/* Other Saved Payments */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Saved Payment Methods</h3>

          <div className="space-y-4">
            {/* UPI */}
            <div className="flex justify-between items-center border rounded-lg p-4">
              <p className="text-sm text-gray-700">
                🏦 UPI – <b>john@upi</b>
              </p>
              <button className="text-blue-600 hover:underline text-sm">
                Use This
              </button>
            </div>

            {/* Card */}
            <div className="flex justify-between items-center border rounded-lg p-4">
              <p className="text-sm text-gray-700">
                💳 MasterCard ending **** 8899
              </p>
              <button className="text-blue-600 hover:underline text-sm">
                Use This
              </button>
            </div>
          </div>

          <button className="mt-4 text-blue-600 hover:underline">
            + Add New Payment Method
          </button>
        </div>
      </main>
    </div>
    </div>
  )
}

export default Paymentuser
