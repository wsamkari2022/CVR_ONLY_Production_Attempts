import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, Scale, Lightbulb, Eye, ChevronDown } from 'lucide-react';
import { DecisionOption, MainScenario } from '../types';

interface AdaptivePreferenceViewProps {
  onBack: () => void;
  selectedOption: DecisionOption;
  mainScenario: MainScenario;
  onConfirm: (option: DecisionOption, isTop2: boolean) => void;
  scenarioId?: number;
  isLastScenario?: boolean;
}

const AdaptivePreferenceView: React.FC<AdaptivePreferenceViewProps> = ({
  onBack,
  selectedOption,
  mainScenario,
  onConfirm,
  scenarioId = 1,
  isLastScenario = false
}) => {
  const [isWhyCollapsed, setIsWhyCollapsed] = useState(true);

  const { comparisonTableColumnContent } = selectedOption;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6 flex-1 flex flex-col">
      <div className="max-w-5xl mx-auto w-full">
        <button
          onClick={onBack}
          className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Simulation
        </button>

        <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <button
            onClick={() => setIsWhyCollapsed(!isWhyCollapsed)}
            className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <Lightbulb className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Why You're Seeing This Page</h3>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-600 transition-transform duration-300 ${isWhyCollapsed ? '' : 'rotate-180'}`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${isWhyCollapsed ? 'max-h-0' : 'max-h-96'}`}
          >
            <div className="pt-4 space-y-3">
              <p className="text-gray-800 leading-relaxed text-sm">
                This section is here to simply help you reflect — not to tell you what you should have chosen.
              </p>
              <p className="text-gray-800 leading-relaxed text-sm">
                The purpose of the value-reflection scenario is to show how the same core values feel when they appear in a different storyline.
              </p>
              <p className="text-gray-800 leading-relaxed text-sm">
                Sometimes people respond differently without realizing it. This page helps you think about which part of your decision-making matters most to you right now.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-5 text-center">
            We Noticed a Difference in Your Recent Choices
          </h1>

          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6 shadow-sm">
            <p className="text-gray-800 leading-relaxed mb-3 text-sm">
              Earlier in the simulation, you selected an option that reflected a certain value.
            </p>
            <p className="text-gray-800 leading-relaxed mb-3 text-sm">
              A moment later, when you were shown a very similar scenario designed to reflect your chosen value-based option, you reacted differently and rejected the same value-based option you had previously accepted in a different scenario.
            </p>
            <p className="text-gray-700 leading-relaxed italic text-sm">
              This happens to many people — especially when the same moral values appear in new or stressful contexts.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                <Eye className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Here's What You Chose Before</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Scale className="text-blue-600" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Your Simulation Scenario Choice</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scenario Title</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.firstColumnTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Affected Population</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.firstColumnAffected.toLocaleString()} residents</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Decision Trade-off</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.firstColumnRisk}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Applied Moral Value</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.firstValue}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Response</p>
                    <p className={`text-sm font-semibold ${
                      comparisonTableColumnContent.firstColumnuserChoice === "Accepted" ? "text-green-600" : "text-red-600"
                    }`}>
                      {comparisonTableColumnContent.firstColumnuserChoice === "Accepted" ? "✓ Accepted" : "✗ Rejected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Eye className="text-teal-600" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-teal-900">Your Value-Reflection Scenario Choice</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scenario Title</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.secondColumnTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Affected Population</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.secondColumnaffected.toLocaleString()} residents</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Decision Trade-off</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.secondColumnRisk}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Applied Moral Value</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.secondValue}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Response</p>
                    <p className={`text-sm font-semibold ${
                      comparisonTableColumnContent.secondColumnuserChoice === "Accepted" ? "text-green-600" : "text-red-600"
                    }`}>
                      {comparisonTableColumnContent.secondColumnuserChoice === "Accepted" ? "✓ Accepted" : "✗ Rejected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <p className="text-amber-900 font-medium text-sm">
                Both scenarios affected the same number of residents and carried nearly the same consequences, yet your reactions were different.
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowLeft size={24} />
            Return to Simulation Main Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdaptivePreferenceView;