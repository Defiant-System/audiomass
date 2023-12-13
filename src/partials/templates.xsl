<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="blank-view">
	<h2>Welcome to Audiomass.</h2>

	<div class="block-buttons">
		<div class="btn" data-click="open-filesystem">
			<i class="icon-folder-open"></i>
			Open&#8230;
		</div>

		<div class="btn disabled_" data-click="from-clipboard">
			<i class="icon-clipboard"></i>
			From clipboard
		</div>
	</div>

	<div class="block-samples" data-click="select-sample">
		<h3>Samples</h3>
		<xsl:call-template name="sample-list" />
	</div>

	<xsl:if test="count(./Recents/*) &gt; 0">
		<div class="block-recent" data-click="select-recent-file">
			<h3>Recent</h3>
			<xsl:call-template name="recent-list" />
		</div>
	</xsl:if>
</xsl:template>


<xsl:template name="sample-list">
	<xsl:for-each select="./Samples/*">
		<div class="sample">
			<i>
				<xsl:attribute name="class"><xsl:value-of select="@icon"/></xsl:attribute>
			</i>
			<h4><xsl:value-of select="@name"/></h4>
			<h5><xsl:value-of select="@sizeB"/>, <xsl:value-of select="@duration"/>s</h5>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="recent-list">
	<xsl:for-each select="./Recents/*">
		<div class="recent-file">
			<xsl:attribute name="data-file"><xsl:value-of select="@filepath"/></xsl:attribute>
			<span class="thumbnail">
				<xsl:attribute name="style">background-image: url(<xsl:value-of select="@filepath"/>);</xsl:attribute>
			</span>
			<span class="name"><xsl:value-of select="@name"/></span>
		</div>
	</xsl:for-each>
</xsl:template>

</xsl:stylesheet>