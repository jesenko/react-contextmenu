"use strict";

import React from "react";
import flux from "./flux";
import invariant from "invariant";
import _isObject from "lodash.isobject";

export default function (identifier, configure) {
    return function (Component) {
        const displayName = Component.displayName
            || Component.name
            || "Component";

        invariant(
            identifier && (typeof identifier === "string"
                || typeof identifier === "symbol"
                || typeof identifier === "function"),
            "Expected identifier to be string, symbol or function. See %s",
            displayName
        );

        invariant(
            typeof configure === "function",
            "Expected configure to be a function. See %s",
            displayName
        );

        return React.createClass({
            displayName: `${displayName}ContextMenuLayer`,
            componentDidMount() {
                React.findDOMNode(this)
                    .addEventListener("contextmenu", this.handleContextClick);
            },
            componentWillUnmount() {
                React.findDOMNode(this)
                    .removeEventListener("contextmenu", this.handleContextClick);
            },
            handleContextClick(event) {
                let currentItem = configure(this.props);

                invariant(
                    _isObject(currentItem),
                    "Expected configure to return an object. See %s",
                    displayName
                );

                event.preventDefault();
                const actions = flux.getActions("menu");
                actions.setParams({
                    x: event.clientX,
                    y: event.clientY,
                    currentItem,
                    isVisible: typeof identifier === "function" ? identifier(this.props) : identifier
                });
            },
            render() {
                return (
                    <Component {...this.props} identifier={identifier} />
                );
            }
        });
    };
}