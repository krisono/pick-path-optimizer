import React, { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Button Component
export const Button = forwardRef((props, ref) => {
  const { variant = "primary", size = "md", loading, fullWidth, icon, children, className = "", ...rest } = props;
  
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <button ref={ref} className={classes} disabled={loading} {...rest}>
      {loading && <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </button>
  );
});

Button.displayName = "Button";

// Card Component
export const Card = ({ children, className = "", padding = "md" }) => {
  const paddingClass = padding === "none" ? "" : "p-4";
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

// Banner Component
export const Banner = ({ variant, title, children, dismissible, onDismiss, actions }) => {
  const variantClasses = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div className={`border rounded-lg p-4 ${variantClasses[variant]}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {actions}
          {dismissible && (
            <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Field Component
export const Field = forwardRef((props, ref) => {
  const { label, hint, error, className = "", ...rest } = props;
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...rest}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

Field.displayName = "Field";

// EmptyState Component
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-12 px-4">
    {icon && (
      <div className="mx-auto w-12 h-12 flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-gray-600 max-w-md mx-auto mb-6">{description}</p>}
    {action && action}
  </div>
);

// BottomSheet Component
export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 max-h-[90vh]"
          >
            <div className="flex justify-center py-2">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>
            {title && (
              <div className="px-4 pb-2 border-b border-gray-200">
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
            )}
            <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
