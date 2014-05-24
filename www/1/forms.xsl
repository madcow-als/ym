<?xml version="1.0" encoding="windows-1251" ?>
<!DOCTYPE xsl:stylesheet [ <!ENTITY nbsp "&#160;"> ]>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        xmlns:exsl="http://exslt.org/common"
        xmlns:func="http://exslt.org/functions"
        xmlns:forms="http://localhost/xsl/forms"
        extension-element-prefixes="exsl func forms"
>

    <xsl:template match="doc">
        <html>
            <head>
                <title>Задача XSL</title>
            </head>
            <body>
                <xsl:call-template name="body" />
            </body>
        </html>
    </xsl:template>


    <xsl:template name="body">
        <h1>Задача XSL</h1>

        <p>
            Элементы форм могут быть 2х типов: строка и файл. Еще бывает так, что полей с одинаковым именем несколько.
            <br/>
            Пример того, как может выглядеть xml, я показал в файле doc.xml.
            <br/>
            Ниже представление этих данных.
        </p>
        <hr/>

        <xsl:call-template name="test"/>
    </xsl:template>

    <xsl:template name="test">
        <xsl:variable name="forms" select="//doc/form" />

        <xsl:variable name="checklist">
            <item>name</item>
            <item>lastname</item>
            <item>mail</item>
            <item>text</item>
            <item>profession</item>
            <item>resume</item>
            <item>photo</item>
            <item>somedata</item>
            <item>category</item>
        </xsl:variable>

        <xsl:for-each select="exsl:node-set($checklist)/*">
            <xsl:copy-of select="forms:show($forms, text())"/>
        </xsl:for-each>
    </xsl:template>

    <!--
         @param {nodeset} list
         @param {string} name
         @return {string}
     -->
    <func:function name="forms:show">
        <xsl:param name="list" />
        <xsl:param name="name" />

        <xsl:variable name="items" select="$list[@name = $name]" />

        <func:result>
            <p>
                <strong>
                    <xsl:value-of select="$name"/>
                </strong>
                <xsl:text> = </xsl:text>

                <xsl:choose>
                    <xsl:when test="count($items) = 0">
                        <xsl:text>Поле отсутствует</xsl:text>
                    </xsl:when>
                    <xsl:when test="count($items) = 1">
                        <xsl:copy-of select="forms:printElement($items)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>[</xsl:text>
                        <br></br>

                        <xsl:for-each select="$items">
                            <xsl:if test="position() != 1">
                                <xsl:text>,</xsl:text>
                                <br/>
                            </xsl:if>
                            <span> &nbsp;&nbsp;</span>

                            <xsl:copy-of select="forms:printElement(.)"/>
                        </xsl:for-each>

                         <br/>
                        <xsl:text>]</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </p>

        </func:result>
    </func:function>


    <!--
         @param {nodeset} item
         @return {string}
     -->
    <func:function name="forms:printElement">
        <xsl:param name="item" />

        <func:result>
            <xsl:choose>
                <xsl:when test="$item/@type = 'file'">
                    <xsl:text>"</xsl:text>
                    <xsl:value-of select="$item/@src"/>
                    <xsl:text> </xsl:text>
                    <small>
                        <xsl:text>(</xsl:text>
                        <xsl:value-of select="$item/@size"/>
                        <xsl:text>)</xsl:text>
                    </small>
                    <xsl:text>"</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>"</xsl:text>
                    <span style="white-space:pre">
                        <xsl:value-of select="$item"/>
                    </span>
                    <xsl:text>"</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </func:result>
    </func:function>
</xsl:stylesheet>
